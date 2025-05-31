import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    const process = spawn('python', ['python/parser.py'])
    
    return new Promise((resolve, reject) => {
      let output = ''
      let error = ''

      process.stdin.write(text + '\n')
      process.stdin.end()

      process.stdout.on('data', (data) => {
        output += data.toString()
      })

      process.stderr.on('data', (data) => {
        error += data.toString()
      })

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('Python error:', error)
          reject(new Error(`Process exited with code ${code}`))
          return
        }

        try {
          // Parse the output directly as JSON
          const jsonData = JSON.parse(output.trim())
          console.log('Parsed transaction:', jsonData) // Log to server console
          resolve(NextResponse.json(jsonData))
        } catch (err) {
          console.error('Failed to parse JSON:', err, 'Output was:', output)
          reject(new Error('Failed to parse output JSON'))
        }
      })
    })
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({ error: 'Failed to parse input' }, { status: 500 })
  }
} 