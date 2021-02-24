'use strict'

const assert = require('assert')

const calculate = require('./calculate')
const { describe, it } = require("mocha")

const data = [
  '(10 + 16)/ 2',
  '5*3*2',
  '2+2 * 2',
  '200 /(50*2)',
  '(14 - 7)*(21/3)',
  '(12 * 3)*((2 + 2) * 2)',
  '(12 - 3)*((2 + 2) * (4 / 2))',
  '3+5*6/2+7*5+9/10'
]

describe('calculate', () => {
  it('should calculate', () => {
    assert.deepStrictEqual(data.map(calculate), [13, 30, 6, 2, 49, 288, 72, 53.9])
  })
})