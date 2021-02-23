'use strict'

const OPERATORS = ['+', '-', '*', '/']

const bracketExpressionRegExp = /\(([^)(]+)\)/
const highPriorityCalculationRegExp = /(\d*\s?[*/]\s?\d*)/
const lowPriorityCalculationRegExp = /(\d*\s?[+\-]\s?\d*)/

const startsWithOperatorRegExp = /^[+-/*]/
const endsWithOperatorRegExp = /[+-/*]$/

const trim = str => str.trim()

const sum = (acc, n) => Number(acc) + Number(n)
const sub = (acc, n) => Number(acc) - Number(n)
const multiply = (acc, n) => Number(acc) * Number(n)
const divide = (acc, n) => Number(acc) / Number(n)

const OPERATION_BY_OPERATOR = {
  '+': sum,
  '-': sub,
  '*': multiply,
  '/': divide,
}

const hasOperator = str => typeof str === 'string' && OPERATORS.some(operator => str.includes(operator))

const getMathTask = operator => str => str.split(operator)
  .map(trim)
  .reduce(OPERATION_BY_OPERATOR[operator])

const buildCalculatorItem = operator => ({
  hasOperator: str => str.includes(operator),
  compute    : getMathTask(operator),
})

const CALCULATOR = OPERATORS.map(buildCalculatorItem)

const resolveNextExpression = (operation1, operation2, index) => {
  operation2 = operation2 || ''

  let nextExpression = operation1

  if (!isNaN(index)) {
    nextExpression = operation2.slice(0, index) + operation1 + operation2.slice(index)
  } else if (startsWithOperatorRegExp.test(operation2)) {
    nextExpression = String(operation1) + operation2
  } else if (endsWithOperatorRegExp.test(operation2)) {
    nextExpression = operation2 + String(operation1)
  }

  return nextExpression
}

const invokeNextCalculation = (firstExpression, secondExpression, index) => {
  const result = calculate(firstExpression)

  const nextExpression = resolveNextExpression(result, trim(secondExpression), index)

  return calculate(nextExpression)
}

const getExpressionsByRegExp = (str, regExp) => regExp.exec(str)

const calculate = fullExpression => {
  if (hasOperator(fullExpression)) {
    let expressions = getExpressionsByRegExp(fullExpression, bracketExpressionRegExp)

    if (expressions) {
      const expressionInBrackets = expressions[1]
      const secondExpression = fullExpression.replace(expressions[0], '')

      return invokeNextCalculation(expressionInBrackets, secondExpression, expressions.index)
    }

    const highPriorityExpressions = getExpressionsByRegExp(fullExpression, highPriorityCalculationRegExp)
    const lowPriorityExpressions = getExpressionsByRegExp(fullExpression, lowPriorityCalculationRegExp)

    expressions = highPriorityExpressions || lowPriorityExpressions

    const expressionToCalculate = expressions ? expressions[0] : fullExpression

    const { compute } = CALCULATOR.find(item => item.hasOperator(expressionToCalculate))

    const computedExpression = compute(expressionToCalculate)

    const secondExpression = expressions.input.replace(expressionToCalculate, '')

    return invokeNextCalculation(computedExpression, secondExpression)
  }

  return fullExpression
}

module.exports = calculate