'use client'

import { useEffect, useRef } from 'react'

// TypeScript interfaces for level data structure
interface LevelData {
  GameKey: {
    Levels: {
      LevelsCount: number
      Levels: string[][]
    }
  }
}

export default function GamePage() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameInitialized = useRef(false)

  useEffect(() => {
    if (gameInitialized.current || !gameContainerRef.current) return
    gameInitialized.current = true

    // Dynamically import kaboom to avoid SSR issues
    import('kaboom').then(({ default: kaboom }) => {
      // Start kaboom
      const k = kaboom({
        canvas: gameContainerRef.current?.querySelector('canvas') || undefined,
        width: 800,
        height: 600,
        background: [141, 183, 255],
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
          // component id / name
          id: "big",
          // it requires the scale component
          require: ["scale"],
          // this runs every frame
          update(this: any) {
            if (isBig) {
              timer -= k.dt()
              if (timer <= 0) {
                this.smallify()
              }
            }
            this.scale = this.scale.lerp(k.vec2(destScale), k.dt() * 6)
          },
          // custom methods
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

      // Load levels data
      const loadLevelsData = async (): Promise<void> => {
        try {
          const response = await fetch('/data/levels.json')
          const data: LevelData = await response.json()
          LEVELS = data.GameKey.Levels.Levels
          LEVELS_COUNT = data.GameKey.Levels.LevelsCount
          console.log(`Loaded ${LEVELS_COUNT} levels from JSON`)
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
          // makes it fall to gravity and jumpable
          k.body(),
          // the custom component we defined above
          big(),
          k.anchor("bot"),
        ])

        // action() runs every frame
        player.onUpdate(() => {
          // center camera to player
          k.camPos(player.pos)
          // check fall death
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
          // Set the viewport center to player.pos
          k.camPos(player.pos)
        })

        // player stomps on enemies
        player.onCollide("enemy", (enemy: any, col: any) => {
          // if it's from the top (player is stomping), destroy enemy
          if (col.isBottom()) {
            player.jump(JUMP_FORCE * 1.5)
            k.destroy(enemy)
            k.addKaboom(player.pos)
            k.play("powerup")
          } else {
            // if it's not from the top, player dies
            k.go("lose")
            k.play("hit")
          }
        })

        let hasApple = false

        // grow an apple if player's head bumps into an obj with "prize" tag
        player.onCollide("prize", (obj: any, col: any) => {
          if (col.isTop() && !hasApple) {
            const apple = level.spawn("#", obj.tilePos.sub(0, 1))
            apple.jump()
            hasApple = true
            k.play("blip")
          }
        })

        // player grows big onCollide with an "apple" obj
        player.onCollide("apple", (a: any) => {
          k.destroy(a)
          // as we defined in the big() component
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

        const coinsLabel = k.add([
          k.text((coins ?? 0).toString()),
          k.pos(24, 24),
          k.fixed(),
        ])

        k.add([
          k.text(`Level ${(levelId ?? 0) + 1}/${LEVELS_COUNT}`),
          k.pos(24, 60),
          k.fixed(),
        ])

        function jump() {
          // these 2 functions are provided by body() component
          if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
          }
        }

        // jump with space
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

        // if player onCollide with any obj with "danger" tag, lose
        player.onCollide("danger", () => {
          k.go("lose")
          k.play("hit")
        })
      })

      k.scene("loading", () => {
      k.add([
          k.text("Loading Levels..."),
          k.pos(k.center()),
          k.anchor("center"),
        ])
      })

      k.scene("lose", () => {
        k.add([
          k.text("You Lose"),
          k.pos(k.center()),
          k.anchor("center"),
        ])
        k.onKeyPress(() => k.go("game"))
      })

      k.scene("win", () => {
        k.add([
          k.text("You Win"),
          k.pos(k.center()),
          k.anchor("center"),
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
      // Cleanup if needed
      gameInitialized.current = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Kaboom Platformer Game
        </h1>
        
        <div className="text-center mb-4 text-gray-600">
          <p className="mb-2">
            <strong>Controls:</strong> Arrow keys to move, Space to jump, Down to fast fall
          </p>
          <p className="mb-2">
            <strong>Goal:</strong> Collect coins, avoid spikes and enemies, reach the portal!
          </p>
          <p className="text-sm">
            Press F for fullscreen • Jump on enemies to defeat them • Hit prize blocks for power-ups
          </p>
        </div>

        <div 
          ref={gameContainerRef}
          className="w-full flex justify-center bg-gray-100 rounded-lg overflow-hidden"
          style={{ height: '600px' }}
        >
          <canvas className="max-w-full max-h-full" />
      </div>
      
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>A classic platformer game built with Kaboom.js</p>
        </div>
      </div>
    </div>
  )
} 