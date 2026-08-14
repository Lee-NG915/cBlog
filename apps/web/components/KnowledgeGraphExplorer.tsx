"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DOMAIN_EDGES,
  DOMAIN_META,
  KNOWLEDGE_NODES,
  LAYER_META,
  READING_PATH,
  READING_TRACKS,
  type KnowledgeDomain,
  type KnowledgeLayer,
  type KnowledgeNode,
  getNodeById,
} from "@/lib/knowledge-graph-data";

type ViewMode = "layers" | "domains" | "path";

const LAYER_ORDER: KnowledgeLayer[] = [
  "architecture",
  "module",
  "domain",
  "implementation",
];

function NodeCard({
  node,
  selected,
  dimmed,
  highlighted,
  onSelect,
}: {
  node: KnowledgeNode;
  selected: boolean;
  dimmed: boolean;
  highlighted: boolean;
  onSelect: (id: string) => void;
}) {
  const domain = DOMAIN_META.find((d) => d.id === node.domain);

  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 sm:p-6 ${
        selected
          ? "border-primary-400 bg-primary-50/80 shadow-md ring-2 ring-primary-300/50 dark:border-primary-600 dark:bg-primary-950/40 dark:ring-primary-700/40"
          : highlighted
            ? "border-accent-blue/40 bg-accent-blue/5 shadow-sm dark:border-accent-blue/30 dark:bg-accent-blue/10"
            : "border-line-light bg-surface-light hover:border-primary-200 hover:shadow-sm dark:border-line-dark dark:bg-surface-dark dark:hover:border-primary-800"
      } ${dimmed ? "opacity-35 saturate-50" : "opacity-100"}`}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: domain?.color ?? "#9CA3AF" }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-base font-semibold leading-6 text-ink dark:text-gray-100">
            {node.label}
          </p>
          <p className="mt-2 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
            {node.summary}
          </p>
          {node.blogSlug && (
            <span className="mt-4 inline-flex rounded-full bg-accent-sage/10 px-2.5 py-1 font-sans text-[11px] font-medium tracking-wide text-accent-sage dark:bg-accent-sage/20">
              已有笔记
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function DetailPanel({
  node,
  onClose,
}: {
  node: KnowledgeNode;
  onClose: () => void;
}) {
  const domain = DOMAIN_META.find((d) => d.id === node.domain);
  const related = node.relatedIds
    .map((id) => getNodeById(id))
    .filter(Boolean) as KnowledgeNode[];

  return (
    <div className="rounded-2xl border border-line-light bg-surface-light p-6 shadow-editorial dark:border-line-dark dark:bg-surface-dark sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300">
            {LAYER_META[node.layer].label} · {domain?.label}
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-ink dark:text-gray-50 sm:text-3xl">
            {node.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full border border-line-light px-4 py-2 font-sans text-sm text-ink-muted transition hover:border-primary-200 hover:text-primary-800 dark:border-line-dark dark:text-gray-400"
        >
          收起
        </button>
      </div>

      <p className="mt-5 max-w-3xl font-sans text-base leading-8 text-ink-muted dark:text-gray-300">
        {node.summary}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {node.blogSlug && (
          <Link
            href={`/posts/${node.blogSlug}`}
            className="inline-flex items-center rounded-full bg-accent-sage px-4 py-2 font-sans text-sm font-medium text-white transition hover:opacity-90"
          >
            阅读工程笔记 →
          </Link>
        )}
        <Link
          href="/posts/engineering-practice-hub"
          className="inline-flex items-center rounded-full border border-line-light px-4 py-2 font-sans text-sm text-ink-muted transition hover:border-primary-200 hover:text-primary-800 dark:border-line-dark dark:text-gray-400"
        >
          实践索引
        </Link>
      </div>

      {related.length > 0 && (
        <div className="mt-8 border-t border-line-light pt-6 dark:border-line-dark">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft dark:text-gray-500">
            关联节点
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {related.map((rel) => (
              <span
                key={rel.id}
                className="rounded-full border border-line-light bg-background-light px-3 py-1 font-sans text-xs text-ink-muted dark:border-line-dark dark:bg-background-dark dark:text-gray-400"
              >
                {rel.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeGraphExplorer() {
  const [view, setView] = useState<ViewMode>("layers");
  const [activeDomain, setActiveDomain] = useState<KnowledgeDomain | "all">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string>("arch-multimarket");
  const [pathRole, setPathRole] = useState<string>("前端基础");

  const selectedNode = useMemo(
    () => getNodeById(selectedId) ?? KNOWLEDGE_NODES[0],
    [selectedId],
  );

  const highlightedIds = useMemo(() => {
    const set = new Set<string>([selectedId, ...selectedNode.relatedIds]);
    return set;
  }, [selectedId, selectedNode.relatedIds]);

  const filteredNodes = useMemo(() => {
    if (activeDomain === "all") return KNOWLEDGE_NODES;
    return KNOWLEDGE_NODES.filter((n) => n.domain === activeDomain);
  }, [activeDomain]);

  const nodesByLayer = useMemo(
    () =>
      LAYER_ORDER.map((layer) => ({
        layer,
        nodes: filteredNodes.filter((node) => node.layer === layer),
      })).filter((group) => group.nodes.length > 0),
    [filteredNodes],
  );

  const pathSteps = useMemo(() => {
    return READING_PATH.filter(
      (step) => pathRole === "all" || step.role === pathRole || !step.role,
    ).map((step) => ({
      ...step,
      node: getNodeById(step.nodeId),
    }));
  }, [pathRole]);

  const pathRoles = ["all", "前端基础", "迁移专项", "业务链路"];
  const activeTrack =
    READING_TRACKS.find((track) => track.role === pathRole) ?? READING_TRACKS[0];
  const migratedNoteCount = KNOWLEDGE_NODES.filter((node) => node.blogSlug).length;
  const overviewItems = [
    { label: "结构层级", value: String(LAYER_ORDER.length), note: "从架构到实现" },
    { label: "主题域", value: String(DOMAIN_META.length), note: "覆盖横向能力与业务域" },
    { label: "已整理笔记", value: String(migratedNoteCount), note: "可直接跳转阅读" },
    { label: "推荐路线", value: String(READING_TRACKS.length), note: "按目标快速进入" },
  ];

  useEffect(() => {
    if (view !== "path") return;

    const fallbackNodeId =
      pathRole === "all"
        ? READING_TRACKS[0]?.nodeIds[0]
        : activeTrack?.nodeIds[0];

    if (!fallbackNodeId) return;

    const isSelectedInCurrentPath = pathSteps.some(
      (step) => step.node?.id === selectedId,
    );

    if (!isSelectedInCurrentPath) {
      setSelectedId(fallbackNodeId);
    }
  }, [activeTrack, pathRole, pathSteps, selectedId, view]);

  return (
    <section
      className="not-prose mb-12 space-y-8"
      aria-label="工程实践知识图谱"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-line-light bg-surface-light p-5 shadow-sm dark:border-line-dark dark:bg-surface-dark"
          >
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft dark:text-gray-500">
              {item.label}
            </p>
            <p className="mt-3 font-display text-3xl font-semibold text-ink dark:text-gray-50">
              {item.value}
            </p>
            <p className="mt-2 font-sans text-sm leading-6 text-ink-muted dark:text-gray-400">
              {item.note}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line-light bg-background-light/70 p-5 dark:border-line-dark dark:bg-background-dark/40 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {LAYER_ORDER.map((layer, index) => (
            <div key={layer} className="relative rounded-2xl border border-line-light bg-surface-light p-4 dark:border-line-dark dark:bg-surface-dark">
              <span className="font-sans text-xs font-semibold text-primary-700 dark:text-primary-300">
                Step {index + 1}
              </span>
              <p className="mt-2 font-sans text-sm font-semibold text-ink dark:text-gray-100">
                {LAYER_META[layer].label}
              </p>
              <p className="mt-2 font-sans text-xs leading-5 text-ink-muted dark:text-gray-400">
                {LAYER_META[layer].description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full border border-line-light bg-surface-light p-1 dark:border-line-dark dark:bg-surface-dark">
          {(
            [
              ["layers", "分层全景"],
              ["domains", "域关系"],
              ["path", "阅读路径"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full px-4 py-2 font-sans text-sm transition ${
                view === mode
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-ink-muted hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="font-sans text-xs text-ink-soft dark:text-gray-500">
          点击节点查看摘要与关联 · 先看结构，再选方向，最后进入工程笔记
        </p>
      </div>

      {view !== "path" && (
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setActiveDomain("all")}
            className={`rounded-full px-4 py-2 font-sans text-sm transition ${
              activeDomain === "all"
                ? "bg-primary-100 font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                : "border border-line-light text-ink-muted hover:border-primary-200 dark:border-line-dark dark:text-gray-400"
            }`}
          >
            全部
          </button>
          {DOMAIN_META.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => {
                setActiveDomain(domain.id);
                setView("layers");
              }}
              className={`rounded-full px-4 py-2 font-sans text-sm transition ${
                activeDomain === domain.id
                  ? "font-semibold text-white"
                  : "border border-line-light text-ink-muted hover:border-primary-200 dark:border-line-dark dark:text-gray-400"
              }`}
              style={
                activeDomain === domain.id
                  ? { backgroundColor: domain.color }
                  : undefined
              }
            >
              {domain.label}
              <span className="ml-1 opacity-70">{domain.docCount}</span>
            </button>
          ))}
        </div>
      )}

      {view === "layers" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-line-light bg-background-light/60 p-6 dark:border-line-dark dark:bg-background-dark/40 sm:p-8">
            <div className="space-y-10">
              {nodesByLayer.map(({ layer, nodes }) => (
                <div key={layer}>
                  <div className="mb-5 border-b border-line-light pb-4 dark:border-line-dark">
                    <p className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">
                      {LAYER_META[layer].label}
                    </p>
                    <p className="mt-2 max-w-2xl font-sans text-sm leading-7 text-ink-soft dark:text-gray-500">
                      {LAYER_META[layer].description}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {nodes.map((node) => (
                      <NodeCard
                        key={node.id}
                        node={node}
                        selected={selectedId === node.id}
                        dimmed={false}
                        highlighted={
                          highlightedIds.has(node.id) && selectedId !== node.id
                        }
                        onSelect={setSelectedId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DetailPanel
            node={selectedNode}
            onClose={() => setSelectedId("arch-multimarket")}
          />
        </div>
      )}

      {view === "domains" && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-line-light bg-surface-light p-5 dark:border-line-dark dark:bg-surface-dark sm:p-6">
            <svg
              viewBox="0 0 640 420"
              className="h-auto w-full"
              role="img"
              aria-label="领域关系图"
            >
              {DOMAIN_EDGES.map(([from, to], index) => {
                const fromMeta = DOMAIN_META.find((d) => d.id === from);
                const toMeta = DOMAIN_META.find((d) => d.id === to);
                const fromIndex = DOMAIN_META.findIndex((d) => d.id === from);
                const toIndex = DOMAIN_META.findIndex((d) => d.id === to);
                const x1 = 80 + (fromIndex % 4) * 140;
                const y1 = 60 + Math.floor(fromIndex / 4) * 120;
                const x2 = 80 + (toIndex % 4) * 140;
                const y2 = 60 + Math.floor(toIndex / 4) * 120;
                const active =
                  activeDomain === "all" ||
                  activeDomain === from ||
                  activeDomain === to;

                return (
                  <line
                    key={`${from}-${to}-${index}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={active ? "#315F72" : "#E5E7EB"}
                    strokeWidth={active ? 2 : 1}
                    strokeOpacity={active ? 0.7 : 0.35}
                    markerEnd="url(#arrow)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="#315F72" fillOpacity="0.6" />
                </marker>
              </defs>
              {DOMAIN_META.map((domain, index) => {
                const x = 50 + (index % 4) * 140;
                const y = 45 + Math.floor(index / 4) * 120;
                const active =
                  activeDomain === "all" || activeDomain === domain.id;

                return (
                  <g
                    key={domain.id}
                    className="cursor-pointer"
                    onClick={() => setActiveDomain(domain.id)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 34 : 28}
                      fill={domain.color}
                      fillOpacity={active ? 0.18 : 0.08}
                      stroke={domain.color}
                      strokeWidth={active ? 2 : 1}
                    />
                    <text
                      x={x}
                      y={y - 4}
                      textAnchor="middle"
                      className="fill-ink text-[11px] font-semibold dark:fill-gray-100"
                    >
                      {domain.label}
                    </text>
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      className="fill-ink-soft text-[10px] dark:fill-gray-400"
                    >
                      {domain.docCount} 篇
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DOMAIN_META.filter(
                (d) => activeDomain === "all" || d.id === activeDomain,
              ).map((domain) => (
                <div
                  key={domain.id}
                  className="rounded-xl border border-line-light bg-background-light p-4 dark:border-line-dark dark:bg-background-dark"
                >
                  <p className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
                    {domain.label}
                  </p>
                  <p className="mt-1 font-sans text-xs leading-5 text-ink-muted dark:text-gray-400">
                    {domain.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft dark:text-gray-500">
              该域下的节点
            </p>
            {filteredNodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                dimmed={false}
                highlighted={false}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>
      )}

      {view === "path" && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              {READING_TRACKS.map((track) => {
                const active = pathRole === track.role;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      setPathRole(track.role);
                      setSelectedId(track.nodeIds[0]);
                    }}
                    className={`rounded-2xl border p-5 text-left transition sm:p-6 ${
                      active
                        ? "border-primary-400 bg-primary-50/80 shadow-md dark:border-primary-700 dark:bg-primary-950/40"
                        : "border-line-light bg-surface-light hover:border-primary-200 dark:border-line-dark dark:bg-surface-dark"
                    }`}
                  >
                    <span className="rounded-full bg-accent-blue/10 px-2.5 py-1 font-sans text-[11px] font-semibold text-accent-blue">
                      {track.role}
                    </span>
                    <p className="mt-4 font-sans text-base font-semibold leading-6 text-ink dark:text-gray-100">
                      {track.title}
                    </p>
                    <p className="mt-2 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                      {track.summary}
                    </p>
                    <p className="mt-4 font-sans text-xs leading-6 text-ink-soft dark:text-gray-500">
                      读完收获：{track.outcome}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-line-light bg-surface-light p-5 dark:border-line-dark dark:bg-surface-dark sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">
                    当前路线
                  </p>
                  <p className="mt-2 font-sans text-base font-semibold text-ink dark:text-gray-100">
                    {activeTrack.title}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pathRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setPathRole(role)}
                      className={`rounded-full px-3 py-1.5 font-sans text-xs transition ${
                        pathRole === role
                          ? "bg-accent-blue text-white"
                          : "border border-line-light text-ink-muted dark:border-line-dark dark:text-gray-400"
                      }`}
                    >
                      {role === "all" ? "全部路径" : role}
                    </button>
                  ))}
                </div>
              </div>

              <ol className="relative space-y-0 border-l-2 border-primary-200 pl-6 dark:border-primary-800">
              {pathSteps.map((step, index) => {
                if (!step.node) return null;
                return (
                  <li key={`${step.step}-${step.nodeId}-${index}`} className="pb-10 last:pb-0">
                    <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-primary-500 bg-surface-light dark:bg-surface-dark" />
                    <button
                      type="button"
                      onClick={() => setSelectedId(step.node!.id)}
                      className="w-full rounded-2xl border border-line-light bg-background-light p-5 text-left transition hover:border-primary-200 dark:border-line-dark dark:bg-background-dark sm:p-6"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-xs font-semibold text-primary-700 dark:text-primary-300">
                          Step {step.step}
                        </span>
                        {step.role && (
                          <span className="rounded-full bg-accent-blue/10 px-2 py-0.5 font-sans text-[10px] text-accent-blue">
                            {step.role}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-sans text-sm font-semibold text-ink dark:text-gray-100">
                        {step.node.label}
                      </p>
                      <p className="mt-1 font-sans text-xs leading-5 text-ink-muted dark:text-gray-400">
                        {step.node.summary}
                      </p>
                    </button>
                  </li>
                );
              })}
              </ol>
            </div>
          </div>

          <DetailPanel
            node={selectedNode}
            onClose={() => setSelectedId("arch-multimarket")}
          />
        </div>
      )}
    </section>
  );
}
