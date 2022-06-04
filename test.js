const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const schema = require('./')
const tape = require('tape')

// Versions

const versionRE = new RegExp(schema.properties.version.pattern)

const versions = {
  valid: [
    '1.2.3',
    '10.20.30',
    '100.200.300',
    '1.2.3-4',
    '1.2.3-45'
  ],
  invalid: [
    '001.2.3', // leading zeroes in edition
    '01.2.3', // leading zero in edition
    '1.02.3', // leading zero in update
    '1.2.03', // leading zero in correction
    '1.0.0-0', // draft zero
    '1.0.0-01' // leading zero in draft
  ]
}

tape('valid versions', test => {
  for (const version of versions.valid) {
    test.assert(versionRE.test(version), `${version} valid`)
  }
  test.end()
})

tape('invalid versions', test => {
  for (const version of versions.invalid) {
    test.assert(!versionRE.test(version), `${version} invalid`)
  }
  test.end()
})

// Full Objects

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

const objects = {
  valid: {
    'California Governing Law': {
      publisher: 'Stonecutters',
      name: 'California Governing Law',
      version: '1.0.0',
      content: ['The law of the State of California will govern all rights and duties under this agreement.']
    },
    'draft version': {
      publisher: 'Example',
      name: 'Example',
      version: '1.0.0-1',
      content: ['example']
    },
    published: {
      publisher: 'Example',
      name: 'Example',
      version: '1.0.0-1',
      published: '2022-06-04',
      content: ['example']
    },
    notes: {
      publisher: 'Example',
      name: 'Example',
      version: '1.0.0',
      content: ['example'],
      notes: [
        'This is the first note.',
        'This is the second note.'
      ]
    }
  },
  invalid: {
    'no publisher': {
      name: 'Example',
      version: '1.0.0',
      content: ['example']
    },
    'malformed version': {
      publisher: 'Example',
      name: 'Example',
      version: 'xxx',
      content: ['example']
    },
    'leading space in publisher': {
      publisher: ' Example',
      name: 'Example',
      version: '1.0.0',
      content: ['example']
    },
    'leading space in name': {
      publisher: 'Example',
      name: ' Example',
      version: '1.0.0',
      content: ['example']
    },
    'trailing space in publisher': {
      publisher: 'Example ',
      name: 'Example',
      version: '1.0.0',
      content: ['example']
    },
    'trailing space in name': {
      publisher: 'Example',
      name: 'Example ',
      version: '1.0.0',
      content: ['example']
    },
    'version without dots': {
      publisher: 'Example',
      name: 'Example',
      version: '1X2X3',
      content: ['example']
    }
  }
}

for (const label in objects.valid) {
  tape(`valid: ${label}`, test => {
    validate(objects.valid[label])
    test.deepEqual(validate.errors, null, label)
    test.end()
  })
}

for (const label in objects.invalid) {
  tape(`invalid: ${label}`, test => {
    validate(objects.invalid[label])
    test.assert(Array.isArray(validate.errors), label)
    test.end()
  })
}
