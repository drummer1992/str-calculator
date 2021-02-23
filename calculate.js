'use strict'

const OPERATORS = ['+', '-', '*', '/']

const bracketExpressionRegExp = /\(([^)]+)\)/
const highPriorityCalculationRegExp = /(\d*\s?[*/]\s?\d*)/
const lowPriorityCalculationRegExp = /(\d*\s?[+\-]\s?\d*)/

const startsWithOperatorRegExp = /^[+-/*]/
const endsWithOperatorRegExp = /[+-/*]$/

const trim = str => str.trim()

const sum = (acc, n) => Number(acc) + Number(n)
const sub = (acc, n) => Number(acc) - Number(n)
const multiply = (acc, n) => Number(acc) * Number(n)
const divide = (acc, n) => Number(acc) / Number(n)

const getExpression = (str, regExp) => regExp.exec(str)

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

const resolveNextExpression = (operation1, operation2) => {
  operation2 = operation2 || ''

  let nextExpression = operation1

  if (startsWithOperatorRegExp.test(operation2)) {
    nextExpression = String(operation1) + operation2
  }

  if (endsWithOperatorRegExp.test(operation2)) {
    nextExpression = operation2 + String(operation1)
  }

  return nextExpression
}

const invokeNextCalculation = (firstExpression, secondExpression) => {
  const result = calculate(firstExpression)

  const nextExpression = resolveNextExpression(result, trim(secondExpression))

  return calculate(nextExpression)
}

const calculate = fullExpression => {
  if (hasOperator(fullExpression)) {
    const expressions = getExpression(fullExpression, bracketExpressionRegExp)

    if (expressions) {
      const expressionInBrackets = expressions[1]
      const secondExpression = fullExpression.replace(expressions[0], '')

      return invokeNextCalculation(expressionInBrackets, secondExpression)
    }

    const highPriorityExpression = getExpression(fullExpression, highPriorityCalculationRegExp)
    const lowPriorityExpression = getExpression(fullExpression, lowPriorityCalculationRegExp)

    const expression = highPriorityExpression || lowPriorityExpression

    const expressionToCalculate = expression ? expression[0] : fullExpression

    const { compute } = CALCULATOR.find(item => item.hasOperator(expressionToCalculate))

    const computedExpression = compute(expressionToCalculate)

    const secondExpression = expression.input.replace(expressionToCalculate, '')

    return invokeNextCalculation(computedExpression, secondExpression)
  }

  return fullExpression
}

module.exports = calculate