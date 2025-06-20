// Test file to verify imports work
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Search, Upload } from 'lucide-react'

// Create a test schema
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
})

// Test function to verify imports work
function testImports() {
  // Test zod schema
  const result = testSchema.safeParse({ name: 'Test', email: 'test@example.com' })
  console.log('Zod validation result:', result.success)
  
  // Test lucide icons (just verify they exist)
  console.log('Search icon exists:', typeof Search)
  console.log('Upload icon exists:', typeof Upload)
  
  // Test that we can create form resolver
  const resolver = zodResolver(testSchema)
  console.log('Form resolver created:', typeof resolver)
  
  return 'All imports work correctly!'
}

// Export for potential use in tests
export { testImports, testSchema }

// Run the test
console.log(testImports()) 