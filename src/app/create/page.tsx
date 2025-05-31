"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gamepad2, Coins, Wallet, Save, Eye, Download, Play, Grid3X3, Trash2, Copy, Plus, Edit, X, DollarSign, Trophy } from "lucide-react"
import { getWalletInformation, checkWalletConnection, disconnectWallet } from "@/lib/wallet"
import { publishGameToContract, estimatePublishGasCost } from "@/lib/smartContract"

interface WalletInfo {
  address: string;
  network: string;
  chainId: string;
  balance: string;
}

interface LevelData {
  [gameKey: string]: {
    Levels: {
      LevelsCount: number
      Levels: string[][]
    }
  }
}

interface GameLevel {
  id: string
  name: string
  description: string
  grid: string[][]
}

interface Game {
  name: string
  description: string
  difficulty: string
  entryFee: number
  levels: GameLevel[]
  creator: string
}

// Level symbols and their meanings
const LEVEL_SYMBOLS = {
  ' ': { name: 'Empty', description: 'Empty space', color: 'bg-gray-800', icon: '⬜' },
  '=': { name: 'Grass Platform', description: 'Solid grass platform', color: 'bg-green-600', icon: '🟩' },
  '-': { name: 'Steel Platform', description: 'Steel platform', color: 'bg-gray-500', icon: '⬛' },
  '0': { name: 'Bag Block', description: 'Solid bag block', color: 'bg-amber-700', icon: '🟫' },
  '$': { name: 'Coin', description: 'Collectible coin', color: 'bg-yellow-500', icon: '🪙' },
  '%': { name: 'Prize Block', description: 'Hit for power-ups', color: 'bg-orange-600', icon: '📦' },
  '^': { name: 'Spike', description: 'Dangerous spikes', color: 'bg-red-600', icon: '🔺' },
  '#': { name: 'Apple', description: 'Power-up apple', color: 'bg-red-400', icon: '🍎' },
  '>': { name: 'Enemy', description: 'Moving enemy', color: 'bg-purple-600', icon: '👻' },
  '@': { name: 'Portal', description: 'Level exit portal', color: 'bg-blue-600', icon: '🌀' },
}

const GRID_WIDTH = 27
const GRID_HEIGHT = 11

export default function CreatePage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  
  // Game creation state
  const [game, setGame] = useState<Game>({
    name: "",
    description: "",
    difficulty: "Easy",
    entryFee: 10,
    levels: [],
    creator: ""
  })
  
  // Level editor state
  const [isEditingLevel, setIsEditingLevel] = useState(false)
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null)
  const [levelName, setLevelName] = useState("")
  const [levelDescription, setLevelDescription] = useState("")
  const [selectedSymbol, setSelectedSymbol] = useState(' ')
  const [showPreview, setShowPreview] = useState(false)
  const [grid, setGrid] = useState<string[][]>(() => 
    Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(' '))
  )
  const [isDragging, setIsDragging] = useState(false)
  const [presets, setPresets] = useState<LevelData>({})
  const [selectedPreset, setSelectedPreset] = useState("")
  
  const previewRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<{ go: (scene: string) => void } | null>(null)
  const gameInitialized = useRef(false)

  // Load presets from levels.json
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const response = await fetch('/data/levels.json')
        const data: LevelData = await response.json()
        setPresets(data)
      } catch (error) {
        console.error('Failed to load presets:', error)
      }
    }
    loadPresets()
  }, [])

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connection = await checkWalletConnection()
        if (connection) {
          setWalletInfo(connection)
          setGame(prev => ({ ...prev, creator: connection.address }))
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
        setError(errorMessage);
        console.error("Wallet connection error:", error);
      }
    }
    
    checkConnection()
  }, [])

  const handleWalletConnect = async () => {
    if (walletInfo) {
      disconnectWallet()
      setWalletInfo(null)
      setError(null)
      setGame(prev => ({ ...prev, creator: "" }))
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const connection = await getWalletInformation()
      setWalletInfo(connection)
      setGame(prev => ({ ...prev, creator: connection.address }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", error);
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Level Editor Functions
  const handleCellClick = (row: number, col: number) => {
    if (!walletInfo) return
    
    const newGrid = [...grid]
    newGrid[row][col] = selectedSymbol
    setGrid(newGrid)
  }

  const handleMouseDown = (row: number, col: number) => {
    if (!walletInfo) return
    setIsDragging(true)
    handleCellClick(row, col)
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (!walletInfo || !isDragging) return
    handleCellClick(row, col)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const clearGrid = () => {
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(' ')))
  }

  const fillBottomRow = () => {
    const newGrid = [...grid]
    for (let col = 0; col < GRID_WIDTH; col++) {
      newGrid[GRID_HEIGHT - 1][col] = '='
    }
    setGrid(newGrid)
  }

  const loadPreset = (gameKey: string, levelIndex: number) => {
    if (!presets[gameKey] || !presets[gameKey].Levels.Levels[levelIndex]) return
    
    const presetLevel = presets[gameKey].Levels.Levels[levelIndex]
    const newGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(' '))
    
    presetLevel.forEach((row, rowIndex) => {
      if (rowIndex < GRID_HEIGHT) {
        for (let colIndex = 0; colIndex < Math.min(row.length, GRID_WIDTH); colIndex++) {
          newGrid[rowIndex][colIndex] = row[colIndex]
        }
      }
    })
    
    setGrid(newGrid)
    setLevelName(`${gameKey} Level ${levelIndex + 1}`)
    setLevelDescription(`Preset level from ${gameKey}`)
  }

  // Game Management Functions
  const startNewLevel = () => {
    setIsEditingLevel(true)
    setEditingLevelId(null)
    setLevelName("")
    setLevelDescription("")
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(' ')))
    setShowPreview(false)
  }

  const editLevel = (level: GameLevel) => {
    setIsEditingLevel(true)
    setEditingLevelId(level.id)
    setLevelName(level.name)
    setLevelDescription(level.description)
    setGrid(level.grid)
    setShowPreview(false)
  }

  const saveLevel = () => {
    if (!levelName.trim()) {
      alert("Please enter a level name")
      return
    }

    const newLevel: GameLevel = {
      id: editingLevelId || Date.now().toString(),
      name: levelName,
      description: levelDescription,
      grid: grid.map(row => [...row])
    }

    if (editingLevelId) {
      // Update existing level
      setGame(prev => ({
        ...prev,
        levels: prev.levels.map(level => 
          level.id === editingLevelId ? newLevel : level
        )
      }))
    } else {
      // Add new level
      setGame(prev => ({
        ...prev,
        levels: [...prev.levels, newLevel]
      }))
    }

    setIsEditingLevel(false)
    setEditingLevelId(null)
  }

  const deleteLevel = (levelId: string) => {
    setGame(prev => ({
      ...prev,
      levels: prev.levels.filter(level => level.id !== levelId)
    }))
  }

  const cancelLevelEdit = () => {
    setIsEditingLevel(false)
    setEditingLevelId(null)
    setShowPreview(false)
  }

  const exportGame = () => {
    const gameData = {
      ...game,
      levels: game.levels.map(level => ({
        ...level,
        grid: level.grid.map(row => row.join(''))
      }))
    }
    
    const dataStr = JSON.stringify(gameData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${game.name || 'custom-game'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const publishGame = async () => {
    if (!game.name.trim()) {
      alert("Please enter a game name")
      return
    }
    if (game.levels.length === 0) {
      alert("Please add at least one level")
      return
    }
    if (!walletInfo) {
      alert("Please connect your wallet")
      return
    }

    setIsPublishing(true)
    setError(null)

    try {
      // Convert game data for smart contract - format levels as string arrays
      const levelsData = game.levels.map(level => 
        level.grid.map(row => 
          row.map(cell => cell === ' ' ? '0' : cell).join('')
        )
      )

      // Convert cost to wei (multiply by 10^18) for smart contract
      const costInWei = (BigInt(game.entryFee) * BigInt(10 ** 18)).toString()

      const contractParams = {
        gameName: game.name,
        levels: levelsData,
        costOfPlay: costInWei
      }

      console.log("Publishing game to smart contract:", contractParams)

      // Estimate gas cost first
      try {
        const estimatedGas = await estimatePublishGasCost(contractParams)
        console.log("Estimated gas cost:", estimatedGas.toString())
      } catch (gasError) {
        console.warn("Could not estimate gas cost:", gasError)
      }

      // Call the smart contract
      const result = await publishGameToContract(contractParams)

      if (result.success) {
        alert(`Game "${game.name}" published successfully to the blockchain!\n\nTransaction Hash: ${result.transactionHash}`)
        console.log("Publish result:", result)
        
        // Reset the form after successful publish
        setGame({
          name: "",
          description: "",
          difficulty: "Easy",
          entryFee: 10,
          levels: [],
          creator: walletInfo.address
        })
        setIsEditingLevel(false)
        setEditingLevelId(null)
      } else {
        throw new Error(result.error || 'Failed to publish game to blockchain')
      }
    } catch (error) {
      console.error("Publish error:", error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to publish game: ${errorMessage}`)
      alert(`Failed to publish game: ${errorMessage}`)
    } finally {
      setIsPublishing(false)
    }
  }

  // Update preview in real-time when grid changes
  useEffect(() => {
    if (showPreview && gameRef.current) {
      try {
        gameRef.current.go("preview")
      } catch (error) {
        console.log("Preview update error:", error)
      }
    }
  }, [grid, showPreview])

  // Initialize preview when showPreview changes
  useEffect(() => {
    if (showPreview && previewRef.current && !gameInitialized.current) {
      gameInitialized.current = true
      
      import('kaboom').then(({ default: kaboom }) => {
        const k = kaboom({
          canvas: previewRef.current?.querySelector('canvas') || undefined,
          width: 800,
          height: 400,
          background: [20, 20, 30],
          crisp: true,
        })

        gameRef.current = k

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

        k.setGravity(3200)

        const levelConf = {
          tileWidth: 64,
          tileHeight: 64,
          tiles: {
            "=": () => [k.sprite("grass"), k.area(), k.body({ isStatic: true }), k.anchor("bot"), "platform"],
            "-": () => [k.sprite("steel"), k.area(), k.body({ isStatic: true }), k.anchor("bot"), "platform"],
            "0": () => [k.sprite("bag"), k.area(), k.body({ isStatic: true }), k.anchor("bot"), "platform"],
            "$": () => [k.sprite("coin"), k.area(), k.pos(0, -9), k.anchor("bot"), "coin"],
            "%": () => [k.sprite("prize"), k.area(), k.body({ isStatic: true }), k.anchor("bot"), "prize"],
            "^": () => [k.sprite("spike"), k.area(), k.body({ isStatic: true }), k.anchor("bot"), "danger"],
            "#": () => [k.sprite("apple"), k.area(), k.anchor("bot"), k.body(), "apple"],
            ">": () => [k.sprite("ghosty"), k.area(), k.anchor("bot"), k.body(), "enemy"],
            "@": () => [k.sprite("portal"), k.area({ scale: 0.5 }), k.anchor("bot"), k.pos(0, -12), "portal"],
          },
        }

        k.scene("preview", () => {
          const levelData = grid.map(row => row.join(''))
          k.addLevel(levelData, levelConf)

          const player = k.add([
            k.sprite("bean"),
            k.pos(50, 50),
            k.area(),
            k.scale(0.8),
            k.body(),
            k.anchor("bot"),
            "player"
          ])

          player.onUpdate(() => {
            k.camPos(player.pos)
          })

          k.add([
            k.text("Live Preview - Use Arrow Keys + Space", {
              size: 16,
              font: "monospace",
            }),
            k.pos(20, 20),
            k.fixed(),
            k.color(255, 255, 255),
          ])

          k.onKeyPress("space", () => {
            if (player.isGrounded()) {
              player.jump(1320)
            }
          })

          k.onKeyDown("left", () => {
            player.move(-300, 0)
          })

          k.onKeyDown("right", () => {
            player.move(300, 0)
          })

          player.onCollide("coin", (coin) => {
            k.destroy(coin)
          })

          player.onCollide("danger", () => {
            player.pos = k.vec2(50, 50)
          })

          player.onCollide("portal", () => {
            player.pos = k.vec2(50, 50)
          })
        })

        k.go("preview")
      })
    } else if (!showPreview && gameInitialized.current) {
      gameInitialized.current = false
      gameRef.current = null
    }
  }, [showPreview])

  // Add mouse event listeners for drag functionality
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">ChainJump</span>
          </Link>
          <div className="flex items-center space-x-4">
            {walletInfo && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Coins className="h-5 w-5" />
                <span className="font-semibold">{walletInfo.balance} MONAD</span>
              </div>
            )}
            <Button
              onClick={handleWalletConnect}
              disabled={isConnecting}
              variant={walletInfo ? "secondary" : "default"}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting 
                ? "Connecting..." 
                : walletInfo 
                  ? formatAddress(walletInfo.address)
                  : "Connect Wallet"
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 mx-4 mt-4 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Back Button */}
      <section className="py-4 px-4">
        <div className="container mx-auto">
          <Link href="/">
            <Button
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-8">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          Game <span className="text-purple-400">Creator</span>
        </h2>
        
        {!walletInfo && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-3 mb-8 rounded-lg text-center">
            <p className="text-sm">Connect your wallet to start creating games</p>
          </div>
        )}

        {!isEditingLevel ? (
          // Game Overview & Management
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Game Details */}
            <Card className="lg:col-span-2 bg-black/40 border-purple-800/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2 text-purple-400" />
                  Game Details
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Set up your game&apos;s basic information and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gameName" className="text-white">Game Name</Label>
                    <Input
                      id="gameName"
                      value={game.name}
                      onChange={(e) => setGame(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Awesome Game"
                      className="bg-black/20 border-purple-800/30 text-white"
                      disabled={!walletInfo}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
                    <Select 
                      value={game.difficulty} 
                      onValueChange={(value) => setGame(prev => ({ ...prev, difficulty: value }))}
                      disabled={!walletInfo}
                    >
                      <SelectTrigger className="bg-black/20 border-purple-800/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-purple-800/30">
                        <SelectItem value="Easy" className="text-white">Easy</SelectItem>
                        <SelectItem value="Medium" className="text-white">Medium</SelectItem>
                        <SelectItem value="Hard" className="text-white">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gameDescription" className="text-white">Description</Label>
                  <Textarea
                    id="gameDescription"
                    value={game.description}
                    onChange={(e) => setGame(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your game..."
                    className="bg-black/20 border-purple-800/30 text-white min-h-[100px]"
                    disabled={!walletInfo}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryFee" className="text-white">Entry Fee (MONAD)</Label>
                  <Input
                    id="entryFee"
                    type="number"
                    value={game.entryFee}
                    onChange={(e) => setGame(prev => ({ ...prev, entryFee: parseInt(e.target.value) || 0 }))}
                    placeholder="10"
                    className="bg-black/20 border-purple-800/30 text-white"
                    disabled={!walletInfo}
                  />
                  <p className="text-xs text-gray-400">Players will pay this amount to play your game</p>
                </div>
              </CardContent>
            </Card>

            {/* Game Stats & Actions */}
            <Card className="bg-black/40 border-purple-800/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                  Game Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Levels Created</span>
                    <span className="text-white font-semibold">{game.levels.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Fee</span>
                    <span className="text-yellow-400 font-semibold">{game.entryFee} MONAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Difficulty</span>
                    <Badge variant="outline" className={`
                      ${game.difficulty === "Easy" ? "border-green-400 text-green-300" : ""}
                      ${game.difficulty === "Medium" ? "border-yellow-400 text-yellow-300" : ""}
                      ${game.difficulty === "Hard" ? "border-red-400 text-red-300" : ""}
                    `}>
                      {game.difficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creator</span>
                    <span className="text-purple-400 text-xs">
                      {walletInfo ? formatAddress(walletInfo.address) : "Not connected"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-purple-800/30">
                  <Button
                    onClick={exportGame}
                    variant="outline"
                    className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                    disabled={!walletInfo || game.levels.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Game
                  </Button>

                  <Button
                    onClick={publishGame}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    disabled={!walletInfo || game.levels.length === 0 || !game.name.trim() || isPublishing}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {isPublishing ? "Publishing to Blockchain..." : "Publish Game"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Level Editor
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Symbol Palette */}
            <Card className="bg-black/40 border-purple-800/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Grid3X3 className="h-5 w-5 mr-2 text-blue-400" />
                  Symbol Palette
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Click to select, then click/drag on grid
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(LEVEL_SYMBOLS).map(([symbol, info]) => (
                  <Button
                    key={symbol}
                    variant={selectedSymbol === symbol ? "default" : "outline"}
                    className={`w-full justify-start text-left ${
                      selectedSymbol === symbol 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : "border-purple-800/30 hover:bg-purple-800/20"
                    }`}
                    onClick={() => setSelectedSymbol(symbol)}
                    disabled={!walletInfo}
                  >
                    <span className="text-lg mr-3">{info.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{info.name}</div>
                      <div className="text-xs text-gray-400">{info.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Level Editor Grid */}
            <Card className="lg:col-span-2 bg-black/40 border-purple-800/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <Edit className="h-5 w-5 mr-2 text-green-400" />
                      Level Editor ({GRID_WIDTH}x{GRID_HEIGHT})
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {editingLevelId ? "Editing" : "Creating"}: {levelName || "Untitled Level"}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fillBottomRow}
                      className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                      disabled={!walletInfo}
                    >
                      Add Floor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearGrid}
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                      disabled={!walletInfo}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="grid gap-1 p-4 bg-gray-900 rounded-lg overflow-auto select-none" 
                  style={{
                    gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                    maxHeight: '400px'
                  }}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-4 h-4 border border-gray-600 hover:border-purple-400 transition-colors ${
                          LEVEL_SYMBOLS[cell as keyof typeof LEVEL_SYMBOLS]?.color || 'bg-gray-800'
                        } ${!walletInfo ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        onMouseUp={handleMouseUp}
                        disabled={!walletInfo}
                        title={`${LEVEL_SYMBOLS[cell as keyof typeof LEVEL_SYMBOLS]?.name || 'Empty'} (${rowIndex}, ${colIndex})`}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Level Details & Actions */}
            <Card className="bg-black/40 border-purple-800/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Save className="h-5 w-5 mr-2 text-yellow-400" />
                  Level Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Selector */}
                <div className="space-y-2">
                  <Label className="text-white">Load Preset</Label>
                  <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                    <SelectTrigger className="bg-black/20 border-purple-800/30 text-white">
                      <SelectValue placeholder="Choose a preset level" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-purple-800/30">
                      {Object.entries(presets).map(([gameKey, gameData]) =>
                        gameData.Levels.Levels.map((_, levelIndex) => (
                          <SelectItem 
                            key={`${gameKey}-${levelIndex}`} 
                            value={`${gameKey}-${levelIndex}`}
                            className="text-white hover:bg-purple-800/20"
                          >
                            {gameKey} - Level {levelIndex + 1}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedPreset && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const [gameKey, levelIndex] = selectedPreset.split('-')
                        loadPreset(gameKey, parseInt(levelIndex))
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!walletInfo}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Load Preset
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="levelName" className="text-white">Level Name</Label>
                  <Input
                    id="levelName"
                    value={levelName}
                    onChange={(e) => setLevelName(e.target.value)}
                    placeholder="Level 1"
                    className="bg-black/20 border-purple-800/30 text-white"
                    disabled={!walletInfo}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="levelDescription" className="text-white">Description</Label>
                  <Textarea
                    id="levelDescription"
                    value={levelDescription}
                    onChange={(e) => setLevelDescription(e.target.value)}
                    placeholder="Describe this level..."
                    className="bg-black/20 border-purple-800/30 text-white min-h-[80px]"
                    disabled={!walletInfo}
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!walletInfo}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={saveLevel}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={!walletInfo || !levelName.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Level
                    </Button>
                    <Button
                      onClick={cancelLevelEdit}
                      variant="outline"
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Levels Management */}
        {!isEditingLevel && (
          <Card className="mt-6 bg-black/40 border-purple-800/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Play className="h-5 w-5 mr-2 text-green-400" />
                    Game Levels ({game.levels.length})
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your game levels - add, edit, or remove levels
                  </CardDescription>
                </div>
                <Button
                  onClick={startNewLevel}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!walletInfo}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Level
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {game.levels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No levels yet</h3>
                  <p className="text-gray-400 mb-6">Start creating your first level to build your game</p>
                  <Button
                    onClick={startNewLevel}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!walletInfo}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Level
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {game.levels.map((level, index) => (
                    <Card key={level.id} className="bg-purple-900/20 border-purple-800/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-lg">{level.name}</CardTitle>
                            <CardDescription className="text-gray-400">Level {index + 1}</CardDescription>
                          </div>
                          <Badge variant="outline" className="border-purple-400 text-purple-300">
                            {level.grid.flat().filter(cell => cell === '$').length} coins
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {level.description || "No description"}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => editLevel(level)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLevel(level.id)}
                            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {showPreview && isEditingLevel && (
          <Card className="mt-6 bg-black/40 border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-400" />
                Live Preview - {levelName || 'Untitled Level'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Test your level in real-time! Use arrow keys to move and spacebar to jump.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={previewRef}
                className="w-full flex justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg"
                style={{ height: '400px' }}
              >
                <canvas className="max-w-full max-h-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 