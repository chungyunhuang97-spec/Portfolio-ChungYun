/**
 * Hand-coded replacement for the raster "產品資訊架構示意圖" (Figma node
 * 283:4394, exported as a single flattened SVG image asset). The exported
 * asset scaled up soft/blurry on the page, so this rebuilds the same
 * sitemap — every card label matches the Figma export 1:1 — as real SVG
 * `<rect>`/`<text>` nodes, which stay crisp at any size instead of
 * upscaling a raster. Desktop-only illustration; mobile keeps its own
 * simplified numbered-list treatment (see InformationArchitecture.tsx).
 *
 * Layout is a plain left-to-right tree: each node's column (x) is its BFS
 * depth from 首頁, and each node's row (y) is either assigned sequentially
 * (leaves) or averaged from its children (parents) — the same "centered
 * parent over its children" convention most tree/org-chart layouts use.
 * Connectors are cubic-bezier "elbow" curves from a parent's right edge to
 * each child's left edge, matching the smooth S-curve links in the design.
 */
interface FlowNode {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  highlighted?: boolean;
  children?: FlowNode[];
}

const H = 21;
const FONT_SIZE = 15;
const RX = 8;

const tree: FlowNode = {
  label: "首頁",
  x: 0,
  y: 236.1,
  w: 53,
  h: H,
  highlighted: true,
  children: [
    {
      label: "搜索欄",
      x: 79,
      y: 52.5,
      w: 62.5,
      h: H,
      highlighted: true,
      children: [
        {
          label: "搜尋結果頁",
          x: 224.5,
          y: 52.5,
          w: 81.5,
          h: H,
          highlighted: true,
          children: [
            { label: "排序", x: 341.5, y: 0, w: 53, h: H },
            { label: "房源列表", x: 341.5, y: 24, w: 72, h: H },
            { label: "地圖", x: 341.5, y: 48, w: 53, h: H },
            {
              label: "篩選併團服務",
              x: 341.5,
              y: 138,
              w: 91,
              h: H,
              highlighted: true,
              children: [
                {
                  label: "房源資訊頁",
                  x: 458.5,
                  y: 138,
                  w: 81.5,
                  h: H,
                  highlighted: true,
                  children: [
                    { label: "房源詳情", x: 566, y: 72, w: 72, h: H },
                    {
                      label: "房型資訊頁",
                      x: 566,
                      y: 126,
                      w: 81.5,
                      h: H,
                      highlighted: true,
                      children: [
                        { label: "房型詳情", x: 673.5, y: 96, w: 72, h: H },
                        { label: "一般訂房", x: 673.5, y: 120, w: 72, h: H },
                        {
                          label: "併團/開團",
                          x: 673.5,
                          y: 162,
                          w: 81.5,
                          h: H,
                          highlighted: true,
                          children: [
                            {
                              label: "併團資訊",
                              x: 781,
                              y: 162,
                              w: 72,
                              h: H,
                              highlighted: true,
                              children: [
                                { label: "併團資訊", x: 879, y: 144, w: 72, h: H },
                                {
                                  label: "加入併團",
                                  x: 879,
                                  y: 180,
                                  w: 72,
                                  h: H,
                                  highlighted: true,
                                  children: [
                                    { label: "併團申請資訊", x: 977, y: 168, w: 91, h: H },
                                    { label: "送出申請", x: 977, y: 192, w: 72, h: H, highlighted: true },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    { label: "房源評價", x: 566, y: 216, w: 72, h: H },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { label: "併團倒數區", x: 79, y: 240, w: 81.5, h: H },
    { label: "推薦房源", x: 79, y: 264, w: 72, h: H },
    { label: "音樂節/演唱會資訊", x: 79, y: 288, w: 119.5, h: H },
    {
      label: "Tab bar",
      x: 79,
      y: 336,
      w: 100.5,
      h: H,
      children: [
        { label: "併團", x: 224.5, y: 312, w: 53, h: H },
        { label: "我的訂單", x: 224.5, y: 336, w: 72, h: H },
        { label: "個人帳戶頁面", x: 224.5, y: 360, w: 91, h: H },
      ],
    },
  ],
};

function collectNodes(node: FlowNode, acc: FlowNode[] = []): FlowNode[] {
  acc.push(node);
  node.children?.forEach((c) => collectNodes(c, acc));
  return acc;
}

function collectEdges(node: FlowNode, acc: [FlowNode, FlowNode][] = []): [FlowNode, FlowNode][] {
  node.children?.forEach((c) => {
    acc.push([node, c]);
    collectEdges(c, acc);
  });
  return acc;
}

const allNodes = collectNodes(tree);
const allEdges = collectEdges(tree);

const VIEW = { minX: -14, minY: -14, width: 1096, height: 409 };

export function IAFlowDiagram() {
  return (
    <svg
      viewBox={`${VIEW.minX} ${VIEW.minY} ${VIEW.width} ${VIEW.height}`}
      className="h-full w-full"
      role="img"
      aria-label="產品資訊架構示意圖：首頁分出搜索欄、併團倒數區、推薦房源、音樂節與演唱會資訊、Tab bar；搜索欄延伸出完整的搜尋、篩選、房源與併團申請流程。"
    >
      <g>
        {allEdges.map(([parent, child], i) => {
          const x1 = parent.x + parent.w;
          const y1 = parent.y + parent.h / 2;
          const x2 = child.x;
          const y2 = child.y + child.h / 2;
          const midX = x1 + (x2 - x1) * 0.55;
          const tipX = x2 - 4;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${tipX} ${y2}`}
                fill="none"
                stroke="#d6d6d6"
                strokeWidth={1.1}
              />
              <path
                d={`M ${tipX} ${y2 - 2.5} L ${x2} ${y2} L ${tipX} ${y2 + 2.5}`}
                fill="none"
                stroke="#d6d6d6"
                strokeWidth={1.1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </g>
      <g className="font-nunito">
        {allNodes.map((n, i) => (
          <rect
            key={i}
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={RX}
            fill={n.highlighted ? "var(--color-primary-orange)" : "var(--color-proj-white)"}
            stroke={n.highlighted ? "none" : "#ededed"}
            strokeWidth={n.highlighted ? 0 : 1}
          />
        ))}
        {allNodes.map((n, i) => (
          <text
            key={i}
            x={n.x + n.w / 2}
            y={n.y + n.h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={FONT_SIZE}
            fontWeight={700}
            fill={n.highlighted ? "var(--color-proj-white)" : "var(--color-grey-900)"}
          >
            {n.label}
          </text>
        ))}
      </g>
    </svg>
  );
}
