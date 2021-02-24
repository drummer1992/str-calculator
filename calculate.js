'use strict'

const assert = require('assert')

const OPERATORS = ['+', '-', '*', '/']

const bracketExpressionRegExp = /\(([^)(]+)\)/
const highPriorityCalculationRegExp = /(\d*\s?[*/]\s?\d*)/
const lowPriorityCalculationRegExp = /(\d*\s?[+\-]\s?\d*)/

const startsWithOperatorRegExp = /^[+-/*]/
const endsWithOperatorRegExp = /[+-/*]$/

const trim = str => str.trim()
const cleanupSubExpression = (expression, subExpression) => expression.replace(subExpression, '')

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

const getMathTask = operator => str => str.split(operator)
  .map(trim)
  .reduce(OPERATION_BY_OPERATOR[operator])

const buildCalculatorItem = operator => ({
  hasOperator: str => str.includes(operator),
  compute    : getMathTask(operator),
})

const CALCULATOR = OPERATORS.map(buildCalculatorItem)

const resolveNextExpression = (expression1, expression2, index) => {
  expression1 = String(expression1)
  expression2 = expression2 || ''

  let nextExpression = expression1

  if (!isNaN(index)) {
    nextExpression = expression2.slice(0, index) + expression1 + expression2.slice(index)
  } else if (startsWithOperatorRegExp.test(expression2)) {
    nextExpression = expression1 + expression2
  } else if (endsWithOperatorRegExp.test(expression2)) {
    nextExpression = expression2 + expression1
  }

  return nextExpression
}

const invokeNextCalculation = (firstExpression, secondExpression, index) => {
  const result = calculate(firstExpression)

  const nextExpression = resolveNextExpression(result, trim(secondExpression), index)

  return calculate(nextExpression)
}

const getExpressionsByRegExp = (str, regExp) => regExp.exec(str)

const calculationIsNeeded = str => typeof str === 'string'
  && OPERATORS.some(operator => str.includes(operator))

const calculate = fullExpression => {
  if (calculationIsNeeded(fullExpression)) {
    const expressionsWithBrackets = getExpressionsByRegExp(fullExpression, bracketExpressionRegExp)

    if (expressionsWithBrackets) {
      const expressionInBrackets = expressionsWithBrackets[1]
      const secondExpression = cleanupSubExpression(fullExpression, expressionsWithBrackets[0])

      return invokeNextCalculation(
        expressionInBrackets,
        secondExpression,
        expressionsWithBrackets.index,
      )
    }

    const highPriorityExpressions = getExpressionsByRegExp(fullExpression, highPriorityCalculationRegExp)
    const lowPriorityExpressions = getExpressionsByRegExp(fullExpression, lowPriorityCalculationRegExp)

    const expressions = highPriorityExpressions || lowPriorityExpressions

    const expressionToCalculate = expressions ? expressions[0] : fullExpression

    const { compute } = CALCULATOR.find(item => item.hasOperator(expressionToCalculate))

    const computedExpression = compute(expressionToCalculate)

    const secondExpression = cleanupSubExpression(expressions.input, expressionToCalculate)

    return invokeNextCalculation(
      computedExpression,
      secondExpression,
      expressionToCalculate.index,
    )
  }

  assert(!isNaN(fullExpression), 'Unable to calculate math expression')

  return Number(fullExpression)
}

module.exports = calculate