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

const H = 44;

const tree: FlowNode = {
  label: "首頁",
  x: 0,
  y: 592.6,
  w: 70,
  h: H,
  highlighted: true,
  children: [
    {
      label: "搜索欄",
      x: 126,
      y: 148.9,
      w: 85,
      h: H,
      highlighted: true,
      children: [
        {
          label: "搜尋結果頁",
          x: 357,
          y: 148.9,
          w: 115,
          h: H,
          highlighted: true,
          children: [
            { label: "排序", x: 543, y: 22, w: 70, h: H },
            { label: "房源列表", x: 543, y: 80, w: 100, h: H },
            { label: "地圖", x: 543, y: 138, w: 70, h: H },
            {
              label: "篩選併團服務",
              x: 543,
              y: 355.5,
              w: 130,
              h: H,
              highlighted: true,
              children: [
                {
                  label: "房源資訊頁",
                  x: 729,
                  y: 355.5,
                  w: 115,
                  h: H,
                  highlighted: true,
                  children: [
                    { label: "房源詳情", x: 900, y: 196, w: 100, h: H },
                    {
                      label: "房型資訊頁",
                      x: 900,
                      y: 326.5,
                      w: 115,
                      h: H,
                      highlighted: true,
                      children: [
                        { label: "房型詳情", x: 1071, y: 254, w: 100, h: H },
                        { label: "一般訂房", x: 1071, y: 312, w: 100, h: H },
                        {
                          label: "併團/開團",
                          x: 1071,
                          y: 413.5,
                          w: 115,
                          h: H,
                          highlighted: true,
                          children: [
                            {
                              label: "併團資訊",
                              x: 1242,
                              y: 413.5,
                              w: 100,
                              h: H,
                              highlighted: true,
                              children: [
                                { label: "併團資訊", x: 1398, y: 370, w: 100, h: H },
                                {
                                  label: "加入併團",
                                  x: 1398,
                                  y: 457,
                                  w: 100,
                                  h: H,
                                  highlighted: true,
                                  children: [
                                    { label: "併團申請資訊", x: 1554, y: 428, w: 130, h: H },
                                    { label: "送出申請", x: 1554, y: 486, w: 100, h: H, highlighted: true },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    { label: "房源評價", x: 900, y: 544, w: 100, h: H },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { label: "併團倒數區", x: 126, y: 602, w: 115, h: H },
    { label: "推薦房源", x: 126, y: 660, w: 100, h: H },
    { label: "音樂節/演唱會資訊", x: 126, y: 718, w: 175, h: H },
    {
      label: "Tab bar",
      x: 126,
      y: 834,
      w: 145,
      h: H,
      children: [
        { label: "併團", x: 357, y: 776, w: 70, h: H },
        { label: "我的訂單", x: 357, y: 834, w: 100, h: H },
        { label: "個人帳戶頁面", x: 357, y: 892, w: 130, h: H },
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

const VIEW = { minX: -20, minY: -20, width: 1724, height: 954 };

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
          const tipX = x2 - 6;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${tipX} ${y2}`}
                fill="none"
                stroke="#d6d6d6"
                strokeWidth={1.5}
              />
              <path
                d={`M ${tipX} ${y2 - 4} L ${x2} ${y2} L ${tipX} ${y2 + 4}`}
                fill="none"
                stroke="#d6d6d6"
                strokeWidth={1.5}
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
            rx={16}
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
            fontSize={14}
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
