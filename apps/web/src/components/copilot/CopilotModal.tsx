"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, BookOpen, Truck, Store, ExternalLink } from "lucide-react";
import { COPILOT_KNOWLEDGE_BASE, KnowledgeItem } from "../../lib/copilot_kb";

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CopilotModal({ isOpen, onClose }: CopilotModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [spotlightItem, setSpotlightItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setSpotlightItem(null);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return COPILOT_KNOWLEDGE_BASE.slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return COPILOT_KNOWLEDGE_BASE.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [query]);

  const handleSelect = (item: KnowledgeItem) => {
    setSpotlightItem(item);
    if (item.actionUrl) {
      setTimeout(() => {
        router.push(item.actionUrl!);
        onClose();
      }, 400);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredItems.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getIcon = (cat: string) => {
    switch (cat) {
      case "Rule":
        return <BookOpen size={16} color="var(--wp-primary)" />;
      case "Vehicle":
        return <Truck size={16} color="#0284c7" />;
      case "Outlet":
        return <Store size={16} color="#16a34a" />;
      default:
        return <Compass size={16} color="#7c3aed" />;
    }
  };

  return (
    <div
      className="wp-command-backdrop open"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
        zIndex: 9999,
      }}
    >
      <div
        className="wp-command-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "640px",
          backgroundColor: "var(--wp-surface, #ffffff)",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--wp-border)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="wp-command-input-wrap"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.85rem 1rem",
            borderBottom: "1px solid var(--wp-border)",
            gap: "0.75rem",
          }}
        >
          <Search size={18} color="var(--wp-muted)" />
          <input
            autoFocus
            type="text"
            className="wp-command-query"
            placeholder="Ask Copilot or search pages, rules, vehicles, outlets..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.95rem",
              background: "transparent",
              color: "var(--wp-text-main, currentColor)",
            }}
          />
          <kbd
            className="wp-kbd"
            style={{
              fontSize: "0.7rem",
              padding: "0.2rem 0.4rem",
              border: "1px solid var(--wp-border)",
              borderRadius: "4px",
              backgroundColor: "var(--wp-surface-hover, #f1f5f9)",
            }}
          >
            esc
          </kbd>
        </div>

        {spotlightItem && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(55, 122, 139, 0.08)",
              borderBottom: "1px solid var(--wp-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <span className="wp-label" style={{ fontSize: "0.7rem" }}>
                Spotlight Answer · {spotlightItem.category}
              </span>
            </div>
            <h3 style={{ fontSize: "0.95rem", margin: 0, fontWeight: 700 }}>
              {spotlightItem.title}
            </h3>
            <p style={{ fontSize: "0.82rem", margin: "0.35rem 0 0.5rem", color: "var(--wp-subtext)" }}>
              {spotlightItem.details}
            </p>
            {spotlightItem.actionUrl && (
              <span style={{ fontSize: "0.75rem", color: "var(--wp-primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                Navigating to destination... <ExternalLink size={12} />
              </span>
            )}
          </div>
        )}

        <div
          className="wp-command-results"
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            padding: "0.5rem",
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--wp-muted)", fontSize: "0.85rem" }}>
              No matches found in Copilot knowledge base.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`wp-command-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "var(--wp-surface-hover, #f1f5f9)" : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {getIcon(item.category)}
                    <div className="wp-command-item-body">
                      <div
                        className="wp-command-item-title"
                        style={{ fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="wp-command-item-meta"
                        style={{ fontSize: "0.75rem", color: "var(--wp-muted)" }}
                      >
                        {item.summary}
                      </div>
                    </div>
                  </div>
                  <div className="wp-command-item-action">
                    <span
                      className="wp-command-item-action-label"
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                        border: "1px solid var(--wp-border)",
                        color: "var(--wp-muted)",
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          className="wp-command-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.6rem 1rem",
            borderTop: "1px solid var(--wp-border)",
            fontSize: "0.75rem",
            color: "var(--wp-muted)",
            backgroundColor: "var(--wp-subpanel, #f8f8f7)",
          }}
        >
          <span className="wp-command-footer-hint">
            <kbd className="wp-kbd">↵</kbd> to select
          </span>
          <span className="wp-command-footer-hint">
            <kbd className="wp-kbd">↑</kbd> <kbd className="wp-kbd">↓</kbd> to navigate
          </span>
          <span className="wp-command-footer-hint">
            <kbd className="wp-kbd">esc</kbd> to close
          </span>
          <span className="wp-command-footer-hint">
            <kbd className="wp-kbd">⌘</kbd> <kbd className="wp-kbd">K</kbd> to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
