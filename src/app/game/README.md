# Kaplay Game Canvas

A simple collection game built with Kaplay JS and Next.js, demonstrating a modular game architecture.

## Structure

```
src/app/game/
├── page.tsx              # Main game page component
├── layout.tsx            # Game route layout
├── components/
│   └── GameCanvas.tsx    # Reusable game canvas component
├── utils/
│   └── gameUtils.ts      # Game utility functions
└── README.md            # This file
```

## Components

### GameCanvas
A reusable React component that wraps Kaplay JS functionality:
- Handles canvas initialization and cleanup
- Provides ref access to the Kaplay instance
- Supports customizable dimensions, background, and debug mode
- Accepts an initialization callback for game setup

### Game Utilities
Modular utility functions for common game operations:
- `createPlayer()` - Creates a player entity
- `setupPlayerMovement()` - Configures WASD/Arrow key controls
- `keepPlayerInBounds()` - Prevents player from leaving the canvas
- `spawnCollectibles()` - Creates collectible items
- `setupCollisionSystem()` - Handles collision detection and scoring
- `createBackground()` - Sets up the game background
- `createGameTitle()` - Adds title text
- `createInstructions()` - Adds instruction text

## Game Features

- **Player Movement**: WASD or Arrow key controls
- **Collectibles**: Randomly colored circles that spawn around the canvas
- **Scoring**: Points increase when collecting items
- **Boundary Detection**: Player stays within canvas bounds
- **Game Controls**: 
  - R: Restart game
  - P: Pause/Resume
- **Responsive UI**: Clean interface with game controls and instructions

## Usage

1. Navigate to `/game` in your Next.js application
2. Use WASD or Arrow keys to move the green square
3. Collect colored circles to increase your score
4. Press R to restart or P to pause/resume

## Extending the Game

The modular structure makes it easy to extend:

1. **Add new game objects**: Create utility functions in `gameUtils.ts`
2. **Create new scenes**: Add scene definitions in the game initialization
3. **Add assets**: Place sprites in `/public/sprites/` and sounds in `/public/sounds/`
4. **Customize appearance**: Modify colors, sizes, and positions in utility functions
5. **Add new controls**: Extend the movement system in `setupPlayerMovement()`

## Configuration

Game settings can be modified in `gameUtils.ts`:

```typescript
export const defaultGameConfig: GameConfig = {
  width: 800,           // Canvas width
  height: 600,          // Canvas height
  playerSpeed: 200,     // Player movement speed
  collectibleCount: 5,  // Number of collectibles on screen
}
```

## Dependencies

- **Kaplay JS**: Game engine for 2D games
- **React**: UI framework
- **Next.js**: React framework with routing
- **TypeScript**: Type safety and better development experience 