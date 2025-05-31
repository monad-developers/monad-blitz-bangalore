import type { BallEvent } from "./types"

// This is a mock implementation of a ball event listener
// In a real application, this would connect to a WebSocket or other real-time data source

export class BallEventListener {
  private callbacks: ((event: BallEvent) => void)[] = []
  private intervalId: NodeJS.Timeout | null = null

  // Mock ball events for simulation
  private mockEvents: BallEvent[] = [
    {
      over: 16,
      ball: 6,
      result: "DOT",
      batsman: "Virat Kohli",
      bowler: "Mitchell Starc",
      runs: 0,
      timestamp: new Date(),
    },
    {
      over: 17,
      ball: 1,
      result: "ONE_RUN",
      batsman: "Virat Kohli",
      bowler: "Pat Cummins",
      runs: 1,
      timestamp: new Date(),
    },
    {
      over: 17,
      ball: 2,
      result: "SIX",
      batsman: "Rishabh Pant",
      bowler: "Pat Cummins",
      runs: 6,
      timestamp: new Date(),
    },
    {
      over: 17,
      ball: 3,
      result: "FOUR",
      batsman: "Rishabh Pant",
      bowler: "Pat Cummins",
      runs: 4,
      timestamp: new Date(),
    },
  ]

  constructor() {}

  // Start listening for ball events
  public start(): void {
    if (this.intervalId) return

    let eventIndex = 0

    // Simulate ball events every 15 seconds
    this.intervalId = setInterval(() => {
      if (eventIndex >= this.mockEvents.length) {
        eventIndex = 0 // Loop back to the beginning for demo purposes
      }

      const event = this.mockEvents[eventIndex]
      event.timestamp = new Date() // Update timestamp

      this.notifyListeners(event)
      eventIndex++
    }, 15000)
  }

  // Stop listening for ball events
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // Register a callback to be notified of ball events
  public onBallEvent(callback: (event: BallEvent) => void): () => void {
    this.callbacks.push(callback)

    // Return a function to unregister the callback
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback)
    }
  }

  // Notify all registered listeners of a ball event
  private notifyListeners(event: BallEvent): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        console.error("Error in ball event callback:", error)
      }
    })
  }
}

// Export a singleton instance
export const ballEventListener = new BallEventListener()
