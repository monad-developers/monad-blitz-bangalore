import { NextResponse } from 'next/server'
import { spawn, ChildProcess } from 'child_process'

export async function POST() {
  try {
    const pythonProcess: ChildProcess = spawn('python', ['python/voice2json.py'], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    })
    
    return new Promise((resolve) => {
      let output = ''
      let error = ''

      pythonProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString('utf-8')
      })

      pythonProcess.stderr?.on('data', (data: Buffer) => {
        error += data.toString('utf-8')
      })

      pythonProcess.on('close', (code: number | null) => {
        if (code !== 0) {
          console.error('Python error:', error)
          return resolve(NextResponse.json({ 
            error: 'Voice processing failed', 
            details: error 
          }, { status: 500 }))
        }

        try {
          // Parse the output directly as JSON
          const jsonData = JSON.parse(output.trim())
          console.log('Voice processing result:', jsonData)
          
          if (jsonData.error) {
            return resolve(NextResponse.json(jsonData, { status: 500 }))
          }
          
          resolve(NextResponse.json(jsonData))
        } catch (err) {
          console.error('Failed to parse JSON:', err, 'Output was:', output)
          resolve(NextResponse.json({ 
            error: 'Failed to parse output JSON',
            details: output
          }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    console.error('Voice processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process voice input',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 