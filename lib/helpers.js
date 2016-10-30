'use strict'

// This is for ensuring that type/ID combination is unique.
// https://stackoverflow.com/questions/26019147
var delimiter = '__'


// Unfortunately, IndexedDB implementations are pretty buggy. This adapter
// tries to work around the incomplete and buggy implementations of IE10+ and
// iOS 8+.
// http://www.raymondcamden.com/2014/09/25/IndexedDB-on-iOS-8-Broken-Bad


exports.delimiter = delimiter


exports.inputRecord = function (type, record) {
  var recordTypes = this.recordTypes
  var primaryKey = this.keys.primary
  var isArrayKey = this.keys.isArray
  var fields = recordTypes[type]
  var fieldsArray = Object.getOwnPropertyNames(fields)
  var result = {}
  var i, j, field, fieldIsArray

  // ID business.
  result[primaryKey] = type + delimiter + (primaryKey in record ?
    record[primaryKey] : this.common.generateId())

  for (i = 0, j = fieldsArray.length; i < j; i++) {
    field = fieldsArray[i]
    fieldIsArray = fields[field][isArrayKey]

    if (!record.hasOwnProperty(field)) {
      result[field] = fieldIsArray ? [] : null
      continue
    }

    result[field] = record[field]
  }

  return result
}


exports.outputRecord = function (type, record) {
  var recordTypes = this.recordTypes
  var castToNumber = this.common.castToNumber
  var primaryKey = this.keys.primary
  var isArrayKey = this.keys.isArray
  var denormalizedInverseKey = this.keys.denormalizedInverse
  var fields = recordTypes[type]
  var fieldsArray = Object.getOwnPropertyNames(fields)
  var result = {}
  var i, j, field, fieldIsArray, fieldIsDenormalized, value

  // ID business.
  result[primaryKey] = castToNumber(record[primaryKey].split(delimiter)[1])

  for (i = 0, j = fieldsArray.length; i < j; i++) {
    field = fieldsArray[i]
    fieldIsArray = fields[field][isArrayKey]
    value = record.hasOwnProperty(field) ?
      record[field] : fieldIsArray ? [] : null
    fieldIsDenormalized = fields[field][denormalizedInverseKey]

    // Do not enumerate denormalized fields.
    if (fieldIsDenormalized) {
      Object.defineProperty(result, field, {
        configurable: true, writable: true, value: value
      })
      continue
    }

    if (field in record) result[field] = value
  }

  return result
}
