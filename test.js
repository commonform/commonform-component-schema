const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const schema = require('./')
const tape = require('tape')

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

const valid = {
  'California Governing Law': {
    publisher: 'Stonecutters',
    name: 'California Governing Law',
    version: '1.0.0',
    permalink: 'https://stonecutters.law/california-governing-law/1.0.0',
    content: ['The law of the State of California will govern all rights and duties under this agreement.']
  }
}

for (const label in valid) {
  tape(`valid: ${label}`, test => {
    validate(valid[label])
    test.deepEqual(validate.errors, null, label)
    test.end()
  })
}

const invalid = {
  'no publisher': Object.assign({}, valid['California Governing Law'], { publisher: undefined })
}

for (const label in invalid) {
  tape(`invalid: ${label}`, test => {
    validate(invalid[label])
    test.assert(Array.isArray(validate.errors), label)
    test.end()
  })
}
