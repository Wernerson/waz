import { useState } from '#imports'



export interface PageRow {
  id: string
  items: any[] // Array to easily work with vuedraggable. Expect max 1 element.
}

export interface IssuePage {
  pageNumber: number
  rows: PageRow[]
}

export interface Issue {
  id: string
  year: number
  number: number
  releaseDate: string
  pages: IssuePage[]
}

export const generateRowId = () => Math.random().toString(36).substring(2, 9)

export const createDefaultPages = (count: number = 16): IssuePage[] => {
  return Array.from({ length: count }, (_, i) => ({
    pageNumber: i + 1,
    rows: [{ id: generateRowId(), items: [] }]
  }))
}

export const useMagazineIssues = () => {
  const issues = useState<Issue[]>('magazine-issues', () => [])

  const addIssue = (year: number, number: number, releaseDate: string) => {
    const id = `${number}-${year}`
    if (!issues.value.find(i => i.id === id)) {
      issues.value.push({
        id,
        year,
        number,
        releaseDate,
        pages: createDefaultPages(16)
      })
    }
    return id
  }

  const getIssue = (id: string) => {
    return issues.value.find(i => i.id === id)
  }

  return {
    issues,
    addIssue,
    getIssue
  }
}
