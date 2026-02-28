// FormulaEngine - Spreadsheet formula evaluation
import { CellData } from '../storage/storageService';

class FormulaEngine {
  evaluate(formula: string, cells: Record<string, CellData>): string | number {
    try {
      // Remove leading "="
      const expression = formula.substring(1).trim();

      // Handle functions
      if (expression.startsWith('SUM(')) {
        return this.evaluateSum(expression, cells);
      }
      if (expression.startsWith('AVERAGE(')) {
        return this.evaluateAverage(expression, cells);
      }
      if (expression.startsWith('MIN(')) {
        return this.evaluateMin(expression, cells);
      }
      if (expression.startsWith('MAX(')) {
        return this.evaluateMax(expression, cells);
      }

      // Handle basic arithmetic with cell references
      return this.evaluateArithmetic(expression, cells);
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR';
    }
  }

  private evaluateSum(expression: string, cells: Record<string, CellData>): number {
    const range = this.extractRange(expression);
    const values = this.getCellValues(range, cells);
    return values.reduce((sum, val) => sum + val, 0);
  }

  private evaluateAverage(expression: string, cells: Record<string, CellData>): number {
    const range = this.extractRange(expression);
    const values = this.getCellValues(range, cells);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private evaluateMin(expression: string, cells: Record<string, CellData>): number {
    const range = this.extractRange(expression);
    const values = this.getCellValues(range, cells);
    return values.length > 0 ? Math.min(...values) : 0;
  }

  private evaluateMax(expression: string, cells: Record<string, CellData>): number {
    const range = this.extractRange(expression);
    const values = this.getCellValues(range, cells);
    return values.length > 0 ? Math.max(...values) : 0;
  }

  private evaluateArithmetic(expression: string, cells: Record<string, CellData>): number {
    // Replace cell references with values
    let processedExpression = expression;
    const cellRefRegex = /[A-Z]+\d+/g;
    const matches = expression.match(cellRefRegex) || [];
    
    for (const cellRef of matches) {
      const cellData = cells[cellRef];
      const value = cellData?.computed || cellData?.value || 0;
      processedExpression = processedExpression.replace(cellRef, String(value));
    }

    // Evaluate the expression safely
    try {
      // Simple evaluation for basic arithmetic
      return Function('"use strict"; return (' + processedExpression + ')')();
    } catch {
      return 0;
    }
  }

  private extractRange(expression: string): string {
    const match = expression.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }

  private getCellValues(range: string, cells: Record<string, CellData>): number[] {
    if (range.includes(':')) {
      // Range like "A1:A10"
      const [start, end] = range.split(':');
      const cellIds = this.expandRange(start, end);
      return cellIds.map(id => {
        const cell = cells[id];
        const value = cell?.computed || cell?.value || 0;
        return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      });
    } else {
      // Single cell or comma-separated cells
      const cellIds = range.split(',').map(s => s.trim());
      return cellIds.map(id => {
        const cell = cells[id];
        const value = cell?.computed || cell?.value || 0;
        return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      });
    }
  }

  private expandRange(start: string, end: string): string[] {
    const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
    const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
    const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
    const endRow = parseInt(end.match(/\d+/)?.[0] || '1');

    const cells: string[] = [];
    
    // For simplicity, only handle same-column ranges
    if (startCol === endCol) {
      for (let row = startRow; row <= endRow; row++) {
        cells.push(`${startCol}${row}`);
      }
    }

    return cells;
  }
}

export const formulaEngine = new FormulaEngine();
