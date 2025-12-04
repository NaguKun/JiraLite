"use client"

import { useState } from "react"
import { Sparkles, Loader2, Copy, RefreshCw, AlertCircle, CheckCircle2, Tag, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AIPanelProps {
  issueId: string
  issueTitle: string
  issueDescription: string
  currentLabels?: string[]
  onLabelsGenerated?: (labels: string[]) => void
}

interface SummaryResult {
  summary: string
  loading: boolean
  error?: string
}

interface SuggestionResult {
  suggestions: string[]
  loading: boolean
  error?: string
}

interface LabelResult {
  labels: string[]
  confidence: number[]
  loading: boolean
  error?: string
}

interface DuplicateResult {
  found: boolean
  issues?: Array<{ id: string; title: string; similarity: number }>
  loading: boolean
  error?: string
}

export function AIPanel({
  issueId,
  issueTitle,
  issueDescription,
  currentLabels = [],
  onLabelsGenerated,
}: AIPanelProps) {
  const [summary, setSummary] = useState<SummaryResult>({ summary: "", loading: false })
  const [suggestions, setSuggestions] = useState<SuggestionResult>({ suggestions: [], loading: false })
  const [labels, setLabels] = useState<LabelResult>({ labels: [], confidence: [], loading: false })
  const [duplicates, setDuplicates] = useState<DuplicateResult>({ found: false, issues: [], loading: false })

  const generateSummary = async () => {
    setSummary({ summary: "", loading: true })
    try {
      // Simulating API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockSummary =
        "This issue involves fixing a critical bug in the authentication flow where users are unable to log in with specific email domains. The problem appears to be related to domain validation logic that was recently updated."
      setSummary({ summary: mockSummary, loading: false })
    } catch (error) {
      setSummary({ summary: "", loading: false, error: "Failed to generate summary" })
    }
  }

  const generateSuggestions = async () => {
    setSuggestions({ suggestions: [], loading: true })
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockSuggestions = [
        "Check the domain validation regex pattern for edge cases",
        "Add unit tests for different domain formats",
        "Review recent changes to the authentication middleware",
        "Implement a fallback validation method",
        "Test with international domains",
      ]
      setSuggestions({ suggestions: mockSuggestions, loading: false })
    } catch (error) {
      setSuggestions({ suggestions: [], loading: false, error: "Failed to generate suggestions" })
    }
  }

  const suggestLabels = async () => {
    setLabels({ labels: [], confidence: [], loading: true })
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockLabels = ["bug", "authentication", "critical"]
      const mockConfidence = [0.95, 0.88, 0.76]
      setLabels({ labels: mockLabels, confidence: mockConfidence, loading: false })
      if (onLabelsGenerated) {
        onLabelsGenerated(mockLabels)
      }
    } catch (error) {
      setLabels({ labels: [], confidence: [], loading: false, error: "Failed to suggest labels" })
    }
  }

  const detectDuplicates = async () => {
    setDuplicates({ found: false, issues: [], loading: true })
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockIssues = [
        { id: "42", title: "Login failing for @company.de domain", similarity: 0.92 },
        { id: "38", title: "Authentication broken with specific email formats", similarity: 0.78 },
      ]
      setDuplicates({ found: true, issues: mockIssues, loading: false })
    } catch (error) {
      setDuplicates({ found: false, issues: [], loading: false, error: "Failed to detect duplicates" })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Generation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">AI Summary</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={generateSummary}
              disabled={summary.loading}
              className="gap-1 bg-transparent"
            >
              {summary.loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Generate
                </>
              )}
            </Button>
          </div>
          {summary.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{summary.error}</p>
            </div>
          )}
          {summary.summary && (
            <div className="flex items-start gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-border">
              <div className="flex-1">
                <p className="text-sm text-foreground">{summary.summary}</p>
              </div>
              <button
                onClick={() => copyToClipboard(summary.summary)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Label Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Suggested Labels</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={suggestLabels}
              disabled={labels.loading}
              className="gap-1 bg-transparent"
            >
              {labels.loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Suggesting...
                </>
              ) : (
                <>
                  <Tag className="w-3 h-3" />
                  Suggest
                </>
              )}
            </Button>
          </div>
          {labels.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{labels.error}</p>
            </div>
          )}
          {labels.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labels.labels.map((label, idx) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-border rounded-full text-sm"
                >
                  <span>{label}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(labels.confidence[idx] * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solution Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Solution Suggestions</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={generateSuggestions}
              disabled={suggestions.loading}
              className="gap-1 bg-transparent"
            >
              {suggestions.loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Generate
                </>
              )}
            </Button>
          </div>
          {suggestions.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{suggestions.error}</p>
            </div>
          )}
          {suggestions.suggestions.length > 0 && (
            <ul className="space-y-2">
              {suggestions.suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="text-sm text-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Duplicate Detection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Check for Duplicates</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={detectDuplicates}
              disabled={duplicates.loading}
              className="gap-1 bg-transparent"
            >
              {duplicates.loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Detect
                </>
              )}
            </Button>
          </div>
          {duplicates.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{duplicates.error}</p>
            </div>
          )}
          {duplicates.found && duplicates.issues && duplicates.issues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Found {duplicates.issues.length} similar issue(s)
                </p>
              </div>
              <div className="space-y-2">
                {duplicates.issues.map((issue) => (
                  <div key={issue.id} className="p-3 bg-white dark:bg-slate-800 border border-border rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">#{issue.id}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {Math.round(issue.similarity * 100)}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!duplicates.found && !duplicates.loading && duplicates.issues === undefined && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">No duplicates found</p>
            </div>
          )}
        </div>

        {/* Rate Limit Notice */}
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-border text-xs text-muted-foreground">
          AI features are limited to 10 requests per minute or 100 per day. Use wisely!
        </div>
      </CardContent>
    </Card>
  )
}
