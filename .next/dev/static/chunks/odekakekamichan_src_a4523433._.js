(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/odekakekamichan/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/odekakekamichan/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/odekakekamichan/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://sfzjvpordilroakqmjnp.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_pgGTrddwsu5qrYd0Y7XLDw__jefOjKV");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/odekakekamichan/src/app/tourist_spot/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TouristSpotPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/odekakekamichan/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/odekakekamichan/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/odekakekamichan/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/odekakekamichan/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/odekakekamichan/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function TouristSpotPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(17);
    if ($[0] !== "7a94b37ccedb976d87fc7e2a8a6dd7a1210aceea24838ab69a41b9a5a43ea74a") {
        for(let $i = 0; $i < 17; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7a94b37ccedb976d87fc7e2a8a6dd7a1210aceea24838ab69a41b9a5a43ea74a";
    }
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [touristData, setTouristData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    let t1;
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "TouristSpotPage[useEffect()]": ()=>{
                const fetchData = {
                    "TouristSpotPage[useEffect() > fetchData]": async ()=>{
                        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("\u89B3\u5149\u5730").select("*").order("spot_id", {
                            ascending: true
                        });
                        if (!error) {
                            setTouristData(data || []);
                        }
                        setLoading(false);
                    }
                }["TouristSpotPage[useEffect() > fetchData]"];
                fetchData();
            }
        })["TouristSpotPage[useEffect()]"];
        t2 = [];
        $[2] = t1;
        $[3] = t2;
    } else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    if (loading) {
        let t3;
        if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
            t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: "center",
                    padding: "50px"
                },
                children: "読み込み中..."
            }, void 0, false, {
                fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                lineNumber: 57,
                columnNumber: 12
            }, this);
            $[4] = t3;
        } else {
            t3 = $[4];
        }
        return t3;
    }
    let t3;
    let t4;
    let t5;
    let t6;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = {
            backgroundColor: "#f8fafc",
            minHeight: "100vh",
            padding: "40px 20px",
            fontFamily: "\"Helvetica Neue\", Arial, \"Hiragino Kaku Gothic ProN\", \"Hiragino Sans\", Meiryo, sans-serif"
        };
        t4 = {
            maxWidth: "800px",
            margin: "0 auto"
        };
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            style: {
                textAlign: "center",
                marginBottom: "40px"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    style: {
                        color: "#0f172a",
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "10px"
                    },
                    children: "🏞️ 香美市 観光ガイド"
                }, void 0, false, {
                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                    lineNumber: 85,
                    columnNumber: 8
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#64748b"
                    },
                    children: "香美市の魅力的なスポットをご紹介します"
                }, void 0, false, {
                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                    lineNumber: 90,
                    columnNumber: 28
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
            lineNumber: 82,
            columnNumber: 10
        }, this);
        t6 = {
            display: "grid",
            gap: "25px"
        };
        $[5] = t3;
        $[6] = t4;
        $[7] = t5;
        $[8] = t6;
    } else {
        t3 = $[5];
        t4 = $[6];
        t5 = $[7];
        t6 = $[8];
    }
    let t7;
    if ($[9] !== touristData) {
        t7 = touristData.map(_TouristSpotPageTouristDataMap);
        $[9] = touristData;
        $[10] = t7;
    } else {
        t7 = $[10];
    }
    let t8;
    if ($[11] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t6,
            children: t7
        }, void 0, false, {
            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
            lineNumber: 117,
            columnNumber: 10
        }, this);
        $[11] = t7;
        $[12] = t8;
    } else {
        t8 = $[12];
    }
    let t9;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = {
            textAlign: "center",
            marginTop: "50px"
        };
        $[13] = t9;
    } else {
        t9 = $[13];
    }
    let t10;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
            style: t9,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                style: {
                    color: "#38bdf8",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "18px"
                },
                children: "← トップページへ戻る"
            }, void 0, false, {
                fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                lineNumber: 135,
                columnNumber: 30
            }, this)
        }, void 0, false, {
            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
            lineNumber: 135,
            columnNumber: 11
        }, this);
        $[14] = t10;
    } else {
        t10 = $[14];
    }
    let t11;
    if ($[15] !== t8) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t3,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: t4,
                children: [
                    t5,
                    t8,
                    t10
                ]
            }, void 0, true, {
                fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                lineNumber: 147,
                columnNumber: 27
            }, this)
        }, void 0, false, {
            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
            lineNumber: 147,
            columnNumber: 11
        }, this);
        $[15] = t8;
        $[16] = t11;
    } else {
        t11 = $[16];
    }
    return t11;
}
_s(TouristSpotPage, "VwWTyf3Q8ms8OjOOo1RJs9J1qAM=");
_c = TouristSpotPage;
function _TouristSpotPageTouristDataMap(spot) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            backgroundColor: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: "30px"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: {
                        fontSize: "24px",
                        color: "#1e293b",
                        marginBottom: "15px",
                        borderBottom: "2px solid #38bdf8",
                        display: "inline-block"
                    },
                    children: spot.name
                }, void 0, false, {
                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                    lineNumber: 164,
                    columnNumber: 8
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#475569",
                        lineHeight: "1.8",
                        marginBottom: "20px",
                        whiteSpace: "pre-wrap"
                    },
                    children: spot.description
                }, void 0, false, {
                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                    lineNumber: 170,
                    columnNumber: 26
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        backgroundColor: "#f1f5f9",
                        padding: "20px",
                        borderRadius: "12px",
                        fontSize: "14px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: "#64748b",
                                        display: "block"
                                    },
                                    children: "📍 住所"
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 183,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: spot.address || "\u60C5\u5831\u306A\u3057"
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 186,
                                    columnNumber: 26
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                            lineNumber: 183,
                            columnNumber: 10
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: "#64748b",
                                        display: "block"
                                    },
                                    children: "⏰ 営業時間"
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 186,
                                    columnNumber: 98
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: spot.business_hours
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 189,
                                    columnNumber: 27
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                            lineNumber: 186,
                            columnNumber: 93
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: "#64748b",
                                        display: "block"
                                    },
                                    children: "📅 定休日"
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 189,
                                    columnNumber: 76
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: spot.regular_holiday
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 192,
                                    columnNumber: 27
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                            lineNumber: 189,
                            columnNumber: 71
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: "#64748b",
                                        display: "block"
                                    },
                                    children: "💰 料金"
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 192,
                                    columnNumber: 77
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$odekakekamichan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: spot.fee
                                }, void 0, false, {
                                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                                    lineNumber: 195,
                                    columnNumber: 26
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                            lineNumber: 192,
                            columnNumber: 72
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
                    lineNumber: 175,
                    columnNumber: 32
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
            lineNumber: 162,
            columnNumber: 6
        }, this)
    }, spot.spot_id, false, {
        fileName: "[project]/odekakekamichan/src/app/tourist_spot/page.tsx",
        lineNumber: 156,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "TouristSpotPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=odekakekamichan_src_a4523433._.js.map