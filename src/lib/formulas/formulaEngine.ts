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
    // Replace cell references with their numeric values
    let processedExpression = expression;
    const cellRefRegex = /[A-Z]+\d+/g;
    const matches = expression.match(cellRefRegex) || [];

    for (const cellRef of matches) {
      const cellData = cells[cellRef];
      const value = cellData?.computed || cellData?.value || 0;
      const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      processedExpression = processedExpression.replace(cellRef, String(numericValue));
    }

    // Safe whitelist-based arithmetic evaluator — only allows numbers, +, -, *, /, (, ), spaces, and dots
    return this.safeEval(processedExpression);
  }

  /**
   * Safe arithmetic evaluator using a recursive descent parser.
   * Only allows: digits, decimal points, +, -, *, /, (, ), whitespace.
   * Rejects any expression containing other characters to prevent code injection.
   */
  private safeEval(expr: string): number {
    const sanitized = expr.replace(/\s+/g, '');
    // Strict whitelist: only digits, dot, +, -, *, /, (, )
    if (!/^[0-9+\-*/().]+$/.test(sanitized)) {
      return 0;
    }
    try {
      return this.parseExpr(sanitized, { pos: 0 });
    } catch {
      return 0;
    }
  }

  private parseExpr(expr: string, state: { pos: number }): number {
    let result = this.parseTerm(expr, state);
    while (state.pos < expr.length && (expr[state.pos] === '+' || expr[state.pos] === '-')) {
      const op = expr[state.pos++];
      const right = this.parseTerm(expr, state);
      result = op === '+' ? result + right : result - right;
    }
    return result;
  }

  private parseTerm(expr: string, state: { pos: number }): number {
    let result = this.parseFactor(expr, state);
    while (state.pos < expr.length && (expr[state.pos] === '*' || expr[state.pos] === '/')) {
      const op = expr[state.pos++];
      const right = this.parseFactor(expr, state);
      result = op === '*' ? result * right : (right !== 0 ? result / right : 0);
    }
    return result;
  }

  private parseFactor(expr: string, state: { pos: number }): number {
    if (state.pos < expr.length && expr[state.pos] === '(') {
      state.pos++; // consume '('
      const result = this.parseExpr(expr, state);
      if (state.pos < expr.length && expr[state.pos] === ')') state.pos++; // consume ')'
      return result;
    }
    // Handle unary minus
    if (state.pos < expr.length && expr[state.pos] === '-') {
      state.pos++;
      return -this.parseFactor(expr, state);
    }
    // Parse number
    const start = state.pos;
    while (state.pos < expr.length && /[0-9.]/.test(expr[state.pos])) state.pos++;
    const numStr = expr.slice(start, state.pos);
    return numStr ? parseFloat(numStr) : 0;
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
