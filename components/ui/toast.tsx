import * as React from "react"

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow-xl z-50">
      {message}
    </div>
  )
}
