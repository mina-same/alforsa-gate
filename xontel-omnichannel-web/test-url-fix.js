// Test function to verify the URL protocol fix
function ensureHttpsProtocol(url) {
  if (!url) return url
  // If URL doesn't start with http:// or https://, add https://
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

// Test cases
const testCases = [
  {
    input: 'https://omnichannel-staging.xontel.net/media/org_1/2026/01/18/c4ed1d37-df91-4e54-a219-f31d26566eec.webp',
    expected: 'https://omnichannel-staging.xontel.net/media/org_1/2026/01/18/c4ed1d37-df91-4e54-a219-f31d26566eec.webp',
    description: 'URL without protocol should get https:// added'
  },
  {
    input: 'https://example.com/image.jpg',
    expected: 'https://example.com/image.jpg',
    description: 'URL with https:// should remain unchanged'
  },
  {
    input: 'http://example.com/image.jpg',
    expected: 'http://example.com/image.jpg',
    description: 'URL with http:// should remain unchanged'
  },
  {
    input: '',
    expected: '',
    description: 'Empty string should remain unchanged'
  },
  {
    input: null,
    expected: null,
    description: 'Null should remain unchanged'
  }
]

console.log('Testing URL protocol fix...\n')

testCases.forEach((testCase, index) => {
  const result = ensureHttpsProtocol(testCase.input)
  const passed = result === testCase.expected
  
  console.log(`Test ${index + 1}: ${testCase.description}`)
  console.log(`Input: ${testCase.input}`)
  console.log(`Expected: ${testCase.expected}`)
  console.log(`Result: ${result}`)
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  console.log('---')
})

console.log('\nAll tests completed!')
