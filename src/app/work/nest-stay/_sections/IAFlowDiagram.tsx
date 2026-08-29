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
 *
 * Node sizing: per Joe's request every card keeps an even 4px padding
 * around its label on all four sides, rather than a generic min-width —
 * width is `charCount * FONT_SIZE + 2*PAD` (CJK glyphs at this weight run
 * close to 1em of advance width per character, which is what FONT_SIZE
 * approximates) and height is `FONT_SIZE + 2*PAD`, so short and long
 * labels both keep the same visual margin instead of long ones (e.g.
 * "併團申請資訊") crowding their box edges.
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

const H = 23;
const FONT_SIZE = 15;
const RX = 8;

const tree: FlowNode = {
  label: "首頁",
  x: 0,
  y: 245.9,
  w: 38,
  h: H,
  highlighted: true,
  children: [
    {
      label: "搜索欄",
      x: 64,
      y: 54.7,
      w: 53,
      h: H,
      highlighted: true,
      children: [
        {
          label: "搜尋結果頁",
          x: 233,
          y: 54.7,
          w: 83,
          h: H,
          highlighted: true,
          children: [
            { label: "排序", x: 357, y: 0, w: 38, h: H },
            { label: "房源列表", x: 357, y: 25, w: 68, h: H },
            { label: "地圖", x: 357, y: 50, w: 38, h: H },
            {
              label: "篩選併團服務",
              x: 357,
              y: 143.8,
              w: 98,
              h: H,
              highlighted: true,
              children: [
                {
                  label: "房源資訊頁",
                  x: 481,
                  y: 143.8,
                  w: 83,
                  h: H,
                  highlighted: true,
                  children: [
                    { label: "房源詳情", x: 590, y: 75, w: 68, h: H },
                    {
                      label: "房型資訊頁",
                      x: 590,
                      y: 131.2,
                      w: 83,
                      h: H,
                      highlighted: true,
                      children: [
                        { label: "房型詳情", x: 699, y: 100, w: 68, h: H },
                        { label: "一般訂房", x: 699, y: 125, w: 68, h: H },
                        {
                          label: "併團/開團",
                          x: 699,
                          y: 168.8,
                          w: 83,
                          h: H,
                          highlighted: true,
                          children: [
                            {
                              label: "併團資訊",
                              x: 808,
                              y: 168.8,
                              w: 68,
                              h: H,
                              highlighted: true,
                              children: [
                                { label: "併團資訊", x: 902, y: 150, w: 68, h: H },
                                {
                                  label: "加入併團",
                                  x: 902,
                                  y: 187.5,
                                  w: 68,
                                  h: H,
                                  highlighted: true,
                                  children: [
                                    { label: "併團申請資訊", x: 996, y: 175, w: 98, h: H },
                                    { label: "送出申請", x: 996, y: 200, w: 68, h: H, highlighted: true },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    { label: "房源評價", x: 590, y: 225, w: 68, h: H },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { label: "併團倒數區", x: 64, y: 250, w: 83, h: H },
    { label: "推薦房源", x: 64, y: 275, w: 68, h: H },
    { label: "音樂節/演唱會資訊", x: 64, y: 300, w: 143, h: H },
    {
      label: "Tab bar",
      x: 64,
      y: 350,
      w: 113,
      h: H,
      children: [
        { label: "併團", x: 233, y: 325, w: 38, h: H },
        { label: "我的訂單", x: 233, y: 350, w: 68, h: H },
        { label: "個人帳戶頁面", x: 233, y: 375, w: 98, h: H },
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

const VIEW = { minX: -14, minY: -14, width: 1122, height: 426 };

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
