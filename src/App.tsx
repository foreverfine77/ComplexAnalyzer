import { useState } from "react"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Textarea } from "./components/ui/textarea"
import { Label } from "./components/ui/label"
import { Copy, Trash2, Calculator, TrendingUp } from "lucide-react"
import { toast } from 'sonner'
import ComplexPlot from "./components/complex-plot"

interface ComplexNumber {
  real: number
  imag: number
}

interface Statistics {
  mean: ComplexNumber
  variance: number
}

function App() {
  const [input, setInput] = useState("")
  const [complexNumbers, setComplexNumbers] = useState<ComplexNumber[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)

  const parseComplexNumber = (str: string): ComplexNumber | null => {
    // Remove spaces
    str = str.replace(/\s/g, "")

    // Handle pure real numbers
    if (/^-?\d*\.?\d+$/.test(str)) {
      return { real: Number.parseFloat(str), imag: 0 }
    }

    // Handle pure imaginary numbers
    if (/^-?\d*\.?\d*i$/.test(str)) {
      const imagStr = str.replace("i", "") || "1"
      return { real: 0, imag: Number.parseFloat(imagStr === "-" ? "-1" : imagStr) }
    }

    // Handle complex numbers like "a+bi" or "a-bi"
    const complexRegex = /^(-?\d*\.?\d+)([-+])(\d*\.?\d*)i$/
    const match = str.match(complexRegex)

    if (match) {
      const real = Number.parseFloat(match[1])
      const sign = match[2] === "+" ? 1 : -1
      const imagStr = match[3] || "1"
      const imag = sign * Number.parseFloat(imagStr)
      return { real, imag }
    }

    return null
  }

  const parseInput = () => {
    const lines = input.split("\n").filter((line) => line.trim())
    const numbers: ComplexNumber[] = []

    for (const line of lines) {
      // Split by comma or space
      const parts = line.split(/[,\s]+/).filter((part) => part.trim())

      for (const part of parts) {
        const complex = parseComplexNumber(part.trim())
        if (complex) {
          numbers.push(complex)
        }
      }
    }

    return numbers
  }

  const calculateStatistics = (numbers: ComplexNumber[]): Statistics => {
    if (numbers.length === 0) {
      return { mean: { real: 0, imag: 0 }, variance: 0 }
    }

    // Calculate mean
    const meanReal = numbers.reduce((sum, num) => sum + num.real, 0) / numbers.length
    const meanImag = numbers.reduce((sum, num) => sum + num.imag, 0) / numbers.length
    const mean = { real: meanReal, imag: meanImag }

    // Calculate variance (using the magnitude of differences)
    const variance =
      numbers.reduce((sum, num) => {
        const diffReal = num.real - mean.real
        const diffImag = num.imag - mean.imag
        return sum + (diffReal * diffReal + diffImag * diffImag)
      }, 0) / numbers.length

    return { mean, variance }
  }

  const handleCalculate = () => {
    const numbers = parseInput()
    if (numbers.length === 0) {
      toast.error("请输入有效的复数数据")
      return
    }
    setComplexNumbers(numbers)
    const stats = calculateStatistics(numbers)
    setStatistics(stats)
    toast.success(`成功解析 ${numbers.length} 个复数`)
  }

  const formatComplexNumber = (num: ComplexNumber): string => {
    if (num.imag === 0) return num.real.toFixed(4)
    if (num.real === 0) return `${num.imag.toFixed(4)}i`

    const imagPart = num.imag >= 0 ? `+${num.imag.toFixed(4)}i` : `${num.imag.toFixed(4)}i`
    return `${num.real.toFixed(4)}${imagPart}`
  }

  const copyResults = () => {
    if (!statistics) return
    const results = `均值: ${formatComplexNumber(statistics.mean)}\n方差: ${statistics.variance.toFixed(4)}`
    navigator.clipboard.writeText(results)
    toast.success("结果已复制到剪贴板")
  }

  const clearInput = () => {
    setInput("")
    setComplexNumbers([])
    setStatistics(null)
    toast.info("输入和结果已清空")
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-y-auto">
      {/* 背景装饰图案 */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-400 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-32 right-16 w-12 h-12 bg-blue-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-purple-400 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-indigo-400 rounded-full"></div>
      </div>
      
      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 w-full px-6 py-4 pb-8">
          <div className="h-full flex flex-col">
            {/* Header - 固定高度 */}
            <div className="text-center space-y-2 mb-6 flex-shrink-0 bg-white/50 backdrop-blur-sm py-4 px-6 rounded-xl shadow-sm">
              <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                复数数据分析器
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                输入复数数组，计算统计信息并可视化分布
              </p>
            </div>

            {/* 主要内容区域 - 占据剩余空间 */}
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* 主要内容：输入和结果/功能介绍 - 固定高度 */}
              <div className="min-h-[480px] w-full grid grid-cols-3 gap-4">
                {/* Input Section - 左边 2 列 */}
                <div className="col-span-2 flex flex-col">
                  <Card className="shadow-xl border-2 border-blue-100/50 bg-white/90 backdrop-blur-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col hover:border-blue-200/50">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        数据输入
                      </CardTitle>
                      <CardDescription className="text-sm">
                        输入复数，支持格式：1+2i, 3-4i, 5, 6i（每行或用逗号分隔）
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-3">
                      <div className="flex-1 flex flex-col">
                        <Label htmlFor="data-input" className="text-sm font-medium mb-2">复数数据</Label>
                        <Textarea
                          id="data-input"
                          placeholder="例如：&#10;1+2i, 3-4i&#10;5+0i&#10;2-3i, 1+1i"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          className="flex-1 text-sm resize-none"
                        />
                      </div>

                      <div className="flex gap-3 flex-shrink-0">
                        <Button 
                          onClick={handleCalculate} 
                          className="flex-1 h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          计算
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={clearInput} 
                          className="h-10 px-4 text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          清空
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 右侧内容 - 结果或功能介绍 */}
                <div className="col-span-1 flex flex-col">
                  {statistics ? (
                    /* 统计结果 */
                    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-md hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
                      <CardHeader className="pb-3 flex-shrink-0">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          统计结果
                        </CardTitle>
                        <CardDescription className="text-sm">复数数组的均值和方差</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col space-y-3">
                        <div className="flex-1 space-y-3">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <div className="space-y-3">
                              <div>
                                <span className="font-semibold text-blue-700 text-sm">均值：</span>
                                <div className="font-mono text-sm mt-1 text-blue-900 break-all">{formatComplexNumber(statistics.mean)}</div>
                              </div>
                              <div>
                                <span className="font-semibold text-purple-700 text-sm">方差：</span>
                                <div className="font-mono text-sm mt-1 text-purple-900">{statistics.variance.toFixed(4)}</div>
                              </div>
                              <div className="text-xs text-gray-600 pt-2 border-t border-blue-200">
                                数据点数量：{complexNumbers.length}
                              </div>
                            </div>
                          </div>

                          <Button onClick={copyResults} variant="outline" className="w-full h-10 text-sm flex-shrink-0">
                            <Copy className="h-4 w-4 mr-2" />
                            复制结果
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* 功能介绍侧边栏 */
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 backdrop-blur-md hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
                      <CardHeader className="pb-3 flex-shrink-0">
                        <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          <TrendingUp className="h-5 w-5 text-indigo-600" />
                          功能特色
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          强大的复数数据分析工具
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-3 flex-1">
                          {/* 智能解析 */}
                          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100/50 hover:bg-white/80 transition-colors duration-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Calculator className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">智能解析</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">自动识别多种复数格式，支持批量输入处理</p>
                              </div>
                            </div>
                          </div>

                          {/* 统计分析 */}
                          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-green-100/50 hover:bg-white/80 transition-colors duration-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">统计分析</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">计算复数集合的均值、方差等统计指标</p>
                              </div>
                            </div>
                          </div>

                          {/* 数据导出 */}
                          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-100/50 hover:bg-white/80 transition-colors duration-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Copy className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">数据导出</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">一键复制结果，导出可视化图表</p>
                              </div>
                            </div>
                          </div>

                          {/* 可视化 */}
                          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-indigo-100/50 hover:bg-white/80 transition-colors duration-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <TrendingUp className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">可视化</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">复平面分布图，直观展示数据特征</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Visualization Section - 剩余空间 */}
              {complexNumbers.length > 0 && (
                <div className="aspect-[16/9] mt-6">
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-md hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        复数分布图
                      </CardTitle>
                      <CardDescription className="text-sm">复数在复平面上的分布可视化</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 w-full overflow-hidden">
                      <ComplexPlot complexNumbers={complexNumbers} mean={statistics?.mean} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
