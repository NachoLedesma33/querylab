import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState, LoadingState, ErrorState } from "./ResultCanvas"

function noop() {}

describe("ResultCanvas states", () => {
  it("renders empty state with execute button", () => {
    render(<EmptyState onExecute={noop} />)
    expect(screen.getByText("Listo para consultar")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /ejecutar/i })).toBeInTheDocument()
  })

  it("renders loading state", () => {
    render(<LoadingState />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders security error with suggestion", () => {
    render(<ErrorState message="⚠ Seguridad: consulta bloqueada" />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByText(/SELECT \* FROM movies LIMIT 5/i)).toBeInTheDocument()
  })

  it("renders grammar error with suggestion", () => {
    render(<ErrorState message="bad SQL grammar" />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
    expect(screen.getByText(/SELECT \* FROM movies LIMIT 10/i)).toBeInTheDocument()
  })

  it("renders timeout error with suggestion", () => {
    render(<ErrorState message="timeout" />)
    expect(screen.getByText(/tiempo agotado/i)).toBeInTheDocument()
    expect(screen.getByText(/agregá una cláusula LIMIT/i)).toBeInTheDocument()
  })
})