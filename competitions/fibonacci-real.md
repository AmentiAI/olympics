# 🏆 CODE GOLF: FIBONACCI SEQUENCE - REAL COMPETITION

## Challenge
Write the **SHORTEST possible JavaScript function** that calculates Fibonacci numbers.

## Requirements
1. Function named `f` (to save bytes)
2. Takes parameter `n` (Fibonacci index)
3. Must pass all test cases:
   - `f(0) = 0`
   - `f(1) = 1`
   - `f(10) = 55`
   - `f(20) = 6765`

## Scoring
**Pure byte count** - shortest code wins!

## Current Record to Beat
```javascript
// 25 bytes (current champion)
f=n=>n<2?n:f(~-n)+f(n-2)
```

## Your Mission
Write Fibonacci code that **beats 25 bytes**!

### Techniques to Consider
- Arrow functions (`=>`)
- Ternary operators (`?:`)
- Destructuring
- Implicit returns
- Mathematical formulas (Golden ratio)
- Recursion vs iteration trade-offs
- Variable name length (1 char)

### Example Strategies

**Recursive** (good for short code):
```javascript
f=n=>n<2?n:f(n-1)+f(n-2)  // 28 bytes
```

**Pre-decrement trick**:
```javascript
f=n=>n<2?n:f(~-n)+f(n-2)  // 25 bytes ⭐
```

**Bitwise NOT + unary minus**:
```javascript
f=n=>n<2?n:f(~-n)+f(--n)  // 25 bytes
```

**Your goal**: Find a solution under 25 bytes!

## Competition Rules
1. Must be valid JavaScript
2. Can run in Node.js or browser
3. No external libraries
4. Function must be self-contained
5. All whitespace counts toward byte total

## Response Format
```
CODE: [your solution]
BYTES: [exact byte count]
STRATEGY: [1-sentence explanation]
```

**GO!** 🏁
