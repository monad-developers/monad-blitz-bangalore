'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Maximize, Volume2, VolumeX, RotateCcw, Trophy, Coins, Target, Gamepad2 } from 'lucide-react'

// TypeScript interfaces for level data structure
interface LevelData {
  [gameKey: string]: {
    Levels: {
      LevelsCount: number
      Levels: string[][]
    }
  }
}

export default function GamePage() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameInitialized = useRef(false)
  const params = useParams()
  const router = useRouter()
  const gameKey = params.gamekey as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [gameInfo, setGameInfo] = useState<{
    title: string
    description: string
    difficulty: string
    levels: number
    theme: string
    color: string
  } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Game metadata based on game key
  const getGameInfo = (key: string) => {
    const gameData: { [key: string]: any } = {
      '0x001': {
        title: 'Classic Adventure',
        description: 'Navigate through 4 challenging levels with increasing difficulty. Master the basics of platforming!',
        difficulty: 'Easy',
        levels: 4,
        theme: 'Forest',
        color: 'from-green-600 to-emerald-700'
      },
      '0x002': {
        title: 'Speed Challenge',
        description: 'Fast-paced action across 2 intense levels. Quick reflexes required!',
        difficulty: 'Medium',
        levels: 2,
        theme: 'Industrial',
        color: 'from-blue-600 to-cyan-700'
      },
      '0xABC': {
        title: 'Boss Battle',
        description: 'Ultimate challenge in a single epic level. Only the best survive!',
        difficulty: 'Hard',
        levels: 1,
        theme: 'Volcanic',
        color: 'from-red-600 to-orange-700'
      },
      '0x003': {
        title: 'Sky Temple',
        description: 'Ascend through 3 mystical levels in the clouds. Watch your step!',
        difficulty: 'Medium',
        levels: 3,
        theme: 'Sky',
        color: 'from-purple-600 to-indigo-700'
      },
      '0x004': {
        title: 'Underground Maze',
        description: 'Navigate 5 complex underground levels filled with secrets.',
        difficulty: 'Hard',
        levels: 5,
        theme: 'Cave',
        color: 'from-gray-600 to-slate-700'
      },
      '0x005': {
        title: 'Speed Run Arena',
        description: 'Race through 3 intense levels designed for speed. Every second counts!',
        difficulty: 'Hard',
        levels: 3,
        theme: 'Neon',
        color: 'from-pink-600 to-rose-700'
      },
      '0x006': {
        title: 'Mystic Chambers',
        description: 'Explore 4 mysterious levels filled with ancient puzzles and traps.',
        difficulty: 'Medium',
        levels: 4,
        theme: 'Ancient',
        color: 'from-amber-600 to-yellow-700'
      }
    }
    return gameData[key] || gameData['0x001']
  }

  useEffect(() => {
    if (gameKey) {
      setGameInfo(getGameInfo(gameKey))
    }
  }, [gameKey])

  useEffect(() => {
    if (gameInitialized.current || !gameContainerRef.current || !gameKey) return
    gameInitialized.current = true

    // Dynamically import kaboom to avoid SSR issues
    import('kaboom').then(({ default: kaboom }) => {
      // Start kaboom
      const k = kaboom({
        canvas: gameContainerRef.current?.querySelector('canvas') || undefined,
        width: 1000,
        height: 600,
        background: [20, 20, 30],
        crisp: true,
      })

      // Load assets
      k.loadSprite("bean", "/sprites/bean.png")
      k.loadSprite("bag", "/sprites/bag.png")
      k.loadSprite("ghosty", "/sprites/ghosty.png")
      k.loadSprite("spike", "/sprites/spike.png")
      k.loadSprite("grass", "/sprites/grass.png")
      k.loadSprite("steel", "/sprites/steel.png")
      k.loadSprite("prize", "/sprites/jumpy.png")
      k.loadSprite("apple", "/sprites/apple.png")
      k.loadSprite("portal", "/sprites/portal.png")
      k.loadSprite("coin", "/sprites/coin.png")
      k.loadSound("coin", "/examples/sounds/score.mp3")
      k.loadSound("powerup", "/examples/sounds/powerup.mp3")
      k.loadSound("blip", "/examples/sounds/blip.mp3")
      k.loadSound("hit", "/examples/sounds/hit.mp3")
      k.loadSound("portal", "/examples/sounds/portal.mp3")

      k.setGravity(3200)

      // Custom component controlling enemy patrol movement
      function patrol(speed = 60, dir = 1) {
        return {
          id: "patrol",
          require: ["pos", "area"],
          add(this: any) {
            this.on("collide", (obj: any, col: any) => {
              if (col.isLeft() || col.isRight()) {
                dir = -dir
              }
            })
          },
          update(this: any) {
            this.move(speed * dir, 0)
          },
        }
      }

      // Custom component that makes stuff grow big
      function big() {
        let timer = 0
        let isBig = false
        let destScale = 1
        return {
          id: "big",
          require: ["scale"],
          update(this: any) {
            if (isBig) {
              timer -= k.dt()
              if (timer <= 0) {
                this.smallify()
              }
            }
            this.scale = this.scale.lerp(k.vec2(destScale), k.dt() * 6)
          },
          isBig() {
            return isBig
          },
          smallify() {
            destScale = 1
            timer = 0
            isBig = false
          },
          biggify(time: number) {
            destScale = 2
            timer = time
            isBig = true
          },
        }
      }

      // Define some constants
      const JUMP_FORCE = 1320
      const MOVE_SPEED = 480
      const FALL_DEATH = 2400

      // Load levels from JSON file
      let LEVELS: string[][] = []
      let LEVELS_COUNT = 0

      // Load levels data for specific game key
      const loadLevelsData = async (): Promise<void> => {
        try {
          const response = await fetch('/data/levels.json')
          const data: LevelData = await response.json()
          
          if (!data[gameKey]) {
            throw new Error(`Game key "${gameKey}" not found in levels data`)
          }
          
          LEVELS = data[gameKey].Levels.Levels
          LEVELS_COUNT = data[gameKey].Levels.LevelsCount
          console.log(`Loaded ${LEVELS_COUNT} levels for game key: ${gameKey}`)
          setIsLoading(false)
        } catch (error) {
          console.error('Failed to load levels:', error)
          // Fallback to default levels if JSON loading fails
          LEVELS = [
            [
              "    0       ",
              "   --       ",
              "       $$   ",
              " %    ===   ",
              "            ",
              "   ^^  > = @",
              "============",
            ]
          ]
          LEVELS_COUNT = 1
          setIsLoading(false)
        }
      }

      // Define what each symbol means in the level graph
      const levelConf = {
        tileWidth: 64,
        tileHeight: 64,
        tiles: {
          "=": () => [
            k.sprite("grass"),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("bot"),
            k.offscreen({ hide: true }),
            "platform",
          ],
          "-": () => [
            k.sprite("steel"),
            k.area(),
            k.body({ isStatic: true }),
            k.offscreen({ hide: true }),
            k.anchor("bot"),
          ],
          "0": () => [
            k.sprite("bag"),
            k.area(),
            k.body({ isStatic: true }),
            k.offscreen({ hide: true }),
            k.anchor("bot"),
          ],
          "$": () => [
            k.sprite("coin"),
            k.area(),
            k.pos(0, -9),
            k.anchor("bot"),
            k.offscreen({ hide: true }),
            "coin",
          ],
          "%": () => [
            k.sprite("prize"),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("bot"),
            k.offscreen({ hide: true }),
            "prize",
          ],
          "^": () => [
            k.sprite("spike"),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("bot"),
            k.offscreen({ hide: true }),
            "danger",
          ],
          "#": () => [
            k.sprite("apple"),
            k.area(),
            k.anchor("bot"),
            k.body(),
            k.offscreen({ hide: true }),
            "apple",
          ],
          ">": () => [
            k.sprite("ghosty"),
            k.area(),
            k.anchor("bot"),
            k.body(),
            patrol(),
            k.offscreen({ hide: true }),
            "enemy",
          ],
          "@": () => [
            k.sprite("portal"),
            k.area({ scale: 0.5 }),
            k.anchor("bot"),
            k.pos(0, -12),
            k.offscreen({ hide: true }),
            "portal",
          ],
        },
      }

      k.scene("game", ({ levelId, coins }: { levelId?: number; coins?: number } = { levelId: 0, coins: 0 }) => {
        // Add level to scene
        const level = k.addLevel(LEVELS[levelId ?? 0], levelConf)

        // Define player object
        const player = k.add([
          k.sprite("bean"),
          k.pos(0, 0),
          k.area(),
          k.scale(1),
          k.body(),
          big(),
          k.anchor("bot"),
        ])

        player.onUpdate(() => {
          k.camPos(player.pos)
          if (player.pos.y >= FALL_DEATH) {
            k.go("lose")
          }
        })

        player.onBeforePhysicsResolve((collision: any) => {
          if (collision.target.is(["platform", "soft"]) && player.isJumping()) {
            collision.preventResolution()
          }
        })

        player.onPhysicsResolve(() => {
          k.camPos(player.pos)
        })

        player.onCollide("enemy", (enemy: any, col: any) => {
          if (col.isBottom()) {
            player.jump(JUMP_FORCE * 1.5)
            k.destroy(enemy)
            k.addKaboom(player.pos)
            k.play("powerup")
          } else {
            k.go("lose")
            k.play("hit")
          }
        })

        let hasApple = false

        player.onCollide("prize", (obj: any, col: any) => {
          if (col.isTop() && !hasApple) {
            const apple = level.spawn("#", obj.tilePos.sub(0, 1))
            apple.jump()
            hasApple = true
            k.play("blip")
          }
        })

        player.onCollide("apple", (a: any) => {
          k.destroy(a)
          player.biggify(3)
          hasApple = false
          k.play("powerup")
        })

        let coinPitch = 0

        k.onUpdate(() => {
          if (coinPitch > 0) {
            coinPitch = Math.max(0, coinPitch - k.dt() * 100)
          }
        })

        player.onCollide("coin", (c: any) => {
          k.destroy(c)
          k.play("coin", {
            detune: coinPitch,
          })
          coinPitch += 100
          coins = (coins ?? 0) + 1
          coinsLabel.text = coins.toString()
        })

        // Enhanced UI elements
        const coinsLabel = k.add([
          k.text((coins ?? 0).toString(), {
            size: 24,
            font: "monospace",
          }),
          k.pos(80, 32),
          k.fixed(),
          k.color(255, 215, 0),
        ])

        k.add([
          k.sprite("coin"),
          k.pos(40, 32),
          k.fixed(),
          k.scale(0.8),
        ])

        k.add([
          k.text(`Level ${(levelId ?? 0) + 1}/${LEVELS_COUNT}`, {
            size: 20,
            font: "monospace",
          }),
          k.pos(40, 70),
          k.fixed(),
          k.color(255, 255, 255),
        ])

        k.add([
          k.text(`${gameInfo?.title || gameKey}`, {
            size: 16,
            font: "monospace",
          }),
          k.pos(40, 100),
          k.fixed(),
          k.color(150, 150, 255),
        ])

        function jump() {
          if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
          }
        }

        k.onKeyPress("space", jump)
        k.onKeyDown("left", () => {
          player.move(-MOVE_SPEED, 0)
        })
        k.onKeyDown("right", () => {
          player.move(MOVE_SPEED, 0)
        })
        k.onKeyPress("down", () => {
          (player as any).weight = 3
        })
        k.onKeyRelease("down", () => {
          (player as any).weight = 1
        })

        k.onGamepadButtonPress("south", jump)
        k.onGamepadStick("left", (v: any) => {
          player.move(v.x * MOVE_SPEED, 0)
        })

        k.onKeyPress("f", () => {
          k.setFullscreen(!k.isFullscreen())
          setIsFullscreen(!isFullscreen)
        })

        player.onCollide("portal", () => {
          k.play("portal")
          if ((levelId ?? 0) + 1 < LEVELS_COUNT) {
            k.go("game", {
              levelId: (levelId ?? 0) + 1,
              coins: coins ?? 0,
            })
          } else {
            k.go("win")
          }
        })

        player.onCollide("danger", () => {
          k.go("lose")
          k.play("hit")
        })
      })

      k.scene("loading", () => {
        k.add([
          k.text(`Loading ${gameInfo?.title || gameKey}...`, {
            size: 32,
            font: "monospace",
          }),
          k.pos(k.center()),
          k.anchor("center"),
          k.color(255, 255, 255),
        ])
      })

      k.scene("lose", () => {
        k.add([
          k.rect(k.width(), k.height()),
          k.color(0, 0, 0),
          k.opacity(0.7),
        ])
        k.add([
          k.text("Game Over", {
            size: 48,
            font: "monospace",
          }),
          k.pos(k.center().x, k.center().y - 50),
          k.anchor("center"),
          k.color(255, 100, 100),
        ])
        k.add([
          k.text("Press any key to restart", {
            size: 24,
            font: "monospace",
          }),
          k.pos(k.center().x, k.center().y + 20),
          k.anchor("center"),
          k.color(255, 255, 255),
        ])
        k.onKeyPress(() => k.go("game"))
      })

      k.scene("win", () => {
        k.add([
          k.rect(k.width(), k.height()),
          k.color(0, 0, 0),
          k.opacity(0.7),
        ])
        k.add([
          k.text("Victory!", {
            size: 48,
            font: "monospace",
          }),
          k.pos(k.center().x, k.center().y - 50),
          k.anchor("center"),
          k.color(100, 255, 100),
        ])
        k.add([
          k.text("Press any key to play again", {
            size: 24,
            font: "monospace",
          }),
          k.pos(k.center().x, k.center().y + 20),
          k.anchor("center"),
          k.color(255, 255, 255),
        ])
        k.onKeyPress(() => k.go("game"))
      })

      // Start with loading scene
      k.go("loading")

      // Load levels and start the game
      loadLevelsData().then(() => {
        k.go("game")
      })
    })

    return () => {
      gameInitialized.current = false
    }
  }, [gameKey, gameInfo])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    } else {
      gameContainerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    }
  }

  const restartGame = () => {
    gameInitialized.current = false
    window.location.reload()
  }

  if (!gameKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-red-900/20 border-red-500/30">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Invalid Game Key</h1>
            <p className="text-gray-300 mb-6">
              Please provide a valid game key in the URL (e.g., /game/0x001)
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/play">← Back to Games</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-800/30 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">ChainJump</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={restartGame}
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Game Info Card */}
        {gameInfo && (
          <Card className={`mb-6 bg-gradient-to-r ${gameInfo.color} border-0 text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{gameInfo.title}</h1>
                  <p className="text-white/90 mb-4">{gameInfo.description}</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Target className="h-3 w-3 mr-1" />
                      {gameInfo.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      {gameInfo.levels} Levels
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      🎨 {gameInfo.theme}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{gameKey}</div>
                  <div className="text-white/80">Game ID</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls Info */}
        <Card className="mb-6 bg-black/40 border-purple-800/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-white">
                <div className="bg-purple-600/20 p-2 rounded">⌨️</div>
                <div>
                  <div className="font-semibold">Movement</div>
                  <div className="text-sm text-gray-400">Arrow Keys</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white">
                <div className="bg-purple-600/20 p-2 rounded">🚀</div>
                <div>
                  <div className="font-semibold">Jump</div>
                  <div className="text-sm text-gray-400">Spacebar</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white">
                <div className="bg-purple-600/20 p-2 rounded">🎯</div>
                <div>
                  <div className="font-semibold">Goal</div>
                  <div className="text-sm text-gray-400">Reach Portal</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Container */}
        <Card className="bg-black/60 border-purple-800/30 overflow-hidden">
          <CardContent className="p-0">
            {isLoading && (
              <div className="h-[600px] flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin text-4xl mb-4">🎮</div>
                  <div className="text-xl">Loading {gameInfo?.title || gameKey}...</div>
                </div>
              </div>
            )}
            <div 
              ref={gameContainerRef}
              className="w-full flex justify-center bg-gradient-to-b from-slate-800 to-slate-900"
              style={{ height: '600px' }}
            >
              <canvas className="max-w-full max-h-full rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Game Tips */}
        <Card className="mt-6 bg-black/40 border-purple-800/30">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              💡 Pro Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>• Jump on enemies to defeat them</div>
              <div>• Hit prize blocks (%) for power-ups</div>
              <div>• Collect coins ($) for points</div>
              <div>• Avoid spikes (^) and enemies</div>
              <div>• Press F for fullscreen mode</div>
              <div>• Use Down arrow for fast fall</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 