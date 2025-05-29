import { useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Download } from "lucide-react"
import { toast } from 'sonner'

interface ComplexNumber {
  real: number
  imag: number
}

interface ComplexPlotProps {
  complexNumbers: ComplexNumber[]
  mean?: ComplexNumber
}

export default function ComplexPlot({ complexNumbers, mean }: ComplexPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 40

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    if (complexNumbers.length === 0) return

    // Find bounds
    const realValues = complexNumbers.map((n) => n.real)
    const imagValues = complexNumbers.map((n) => n.imag)

    const minReal = Math.min(...realValues)
    const maxReal = Math.max(...realValues)
    const minImag = Math.min(...imagValues)
    const maxImag = Math.max(...imagValues)

    // Add some padding to bounds
    const realRange = maxReal - minReal || 1
    const imagRange = maxImag - minImag || 1
    const realPadding = realRange * 0.1
    const imagPadding = imagRange * 0.1

    const plotMinReal = minReal - realPadding
    const plotMaxReal = maxReal + realPadding
    const plotMinImag = minImag - imagPadding
    const plotMaxImag = maxImag + imagPadding

    // Coordinate transformation functions
    const realToX = (real: number) =>
      padding + ((real - plotMinReal) / (plotMaxReal - plotMinReal)) * (width - 2 * padding)

    const imagToY = (imag: number) =>
      height - padding - ((imag - plotMinImag) / (plotMaxImag - plotMinImag)) * (height - 2 * padding)

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Vertical grid lines (real axis)
    const realStep = (plotMaxReal - plotMinReal) / 10
    for (let i = 0; i <= 10; i++) {
      const real = plotMinReal + i * realStep
      const x = realToX(real)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Horizontal grid lines (imaginary axis)
    const imagStep = (plotMaxImag - plotMinImag) / 10
    for (let i = 0; i <= 10; i++) {
      const imag = plotMinImag + i * imagStep
      const y = imagToY(imag)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2

    // Real axis (horizontal)
    const realAxisY = imagToY(0)
    if (realAxisY >= padding && realAxisY <= height - padding) {
      ctx.beginPath()
      ctx.moveTo(padding, realAxisY)
      ctx.lineTo(width - padding, realAxisY)
      ctx.stroke()
    }

    // Imaginary axis (vertical)
    const imagAxisX = realToX(0)
    if (imagAxisX >= padding && imagAxisX <= width - padding) {
      ctx.beginPath()
      ctx.moveTo(imagAxisX, padding)
      ctx.lineTo(imagAxisX, height - padding)
      ctx.stroke()
    }

    // Draw axis labels
    ctx.fillStyle = "#374151"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Real", width - 20, realAxisY - 5)
    ctx.save()
    ctx.translate(imagAxisX + 20, 30)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Imaginary", 0, 0)
    ctx.restore()

    // Draw complex numbers as points
    complexNumbers.forEach((num) => {
      const x = realToX(num.real)
      const y = imagToY(num.imag)

      // Point
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Point border
      ctx.strokeStyle = "#1e40af"
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw mean if provided
    if (mean) {
      const meanX = realToX(mean.real)
      const meanY = imagToY(mean.imag)

      // Mean point (larger, different color)
      ctx.fillStyle = "#ef4444"
      ctx.beginPath()
      ctx.arc(meanX, meanY, 6, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = "#dc2626"
      ctx.lineWidth = 2
      ctx.stroke()

      // Mean label
      ctx.fillStyle = "#dc2626"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("Mean", meanX + 10, meanY - 10)
    }

    // Draw scale labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"

    // Real axis labels
    for (let i = 0; i <= 10; i += 2) {
      const real = plotMinReal + i * realStep
      const x = realToX(real)
      ctx.fillText(real.toFixed(1), x, height - 10)
    }

    // Imaginary axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 10; i += 2) {
      const imag = plotMinImag + i * imagStep
      const y = imagToY(imag)
      if (Math.abs(imag) > 0.01) {
        ctx.fillText(imag.toFixed(1) + "i", padding - 5, y + 3)
      }
    }
  }, [complexNumbers, mean])

  const exportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const link = document.createElement("a")
      link.download = `complex_plot_${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast.success("PNG图片已下载")
    } catch (error) {
      toast.error("无法导出图片，请重试")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">数据点: {complexNumbers.length} 个</div>
        <Button variant="outline" size="sm" onClick={exportPNG} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          导出PNG
        </Button>
      </div>
      <div className="w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
