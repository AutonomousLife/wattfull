"use client";
import { useState, useMemo } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Slider, AnimCount } from "@/components/ui";
import { ShareBadge } from "@/components/widgets/ShareBadge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function CarbonPage() {
  const { t } = useTheme();
  const [miles, setMiles] = useState(12000);
  const [years, setYears] = useState(5);
  const [mpg, setMpg] = useState(30);

  const co2PerGallon = 8.887;
  const totalGallons = (miles * years) / mpg;
  const totalCO2 = (totalGallons * co2PerGallon) / 1000;
  const trees = Math.round(totalCO2 / 0.022);
  const flights = Math.round((totalCO2 / 0.9) * 10) / 10;
  const phones = Math.round((totalCO2 * 1000) / 0.008);
  const homeDays = Math.round((totalCO2 * 1000) / 7.5);

  const metrics = [
    {
      icon: "\u{1F333}",
      value: trees,
      label: "Trees needed to absorb that CO\u2082",
      sub: `Over ${years} years of growth`,
      key: "Trees",
    },
    {
      icon: "\u2708\uFE0F",
      value: Math.round(flights),
      label: "Round-trip NYC\u2194LA flights",
      sub: "In equivalent emissions",
      key: "Flights",
    },
    {
      icon: "\uD83D\uDCF1",
      value: phones,
      label: "Phone charges worth of energy",
      sub: "From the gas you won't burn",
      key: "Phone Charges",
    },
    {
      icon: "\uD83C\uDFE0",
      value: homeDays,
      label: "Home-days of electricity",
      sub: "Average US household",
      key: "Home-Days",
    },
  ];

  /* --- Bar chart data --- */
  const chartData = useMemo(
    () =>
      metrics.map((m) => ({
        name: m.key,
        value: typeof m.value === "number" ? m.value : parseFloat(m.value),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trees, flights, phones, homeDays]
  );

  /* --- Tree grid --- */
  const TOTAL_GRID = 100; // 10x10 grid
  const filledTrees = Math.min(trees, TOTAL_GRID);

  return (
    <div>
      <h1
        style={{
          fontSize: "clamp(24px,4vw,36px)",
          fontWeight: 800,
          color: t.text,
        }}
      >
        Carbon Impact Calculator
      </h1>
      <p
        style={{
          fontSize: 16,
          color: t.textMid,
          lineHeight: 1.6,
          marginTop: 8,
          maxWidth: 600,
        }}
      >
        See the environmental impact of switching from gas to electric, in terms
        you can actually picture.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: 28,
          marginTop: 28,
        }}
      >
        {/* Controls */}
        <div
          style={{
            background: t.white,
            border: `1px solid ${t.borderLight}`,
            borderRadius: 14,
            padding: 22,
          }}
        >
          <Slider
            label="Annual Miles"
            value={miles}
            onChange={setMiles}
            min={3000}
            max={40000}
            step={1000}
          />
          <Slider
            label="Years"
            value={years}
            onChange={setYears}
            min={1}
            max={15}
            suffix=" yrs"
          />
          <Slider
            label="Current MPG"
            value={mpg}
            onChange={setMpg}
            min={15}
            max={50}
            suffix=" mpg"
          />
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: t.card,
              borderRadius: 10,
              fontSize: 13,
              color: t.textMid,
              lineHeight: 1.8,
            }}
          >
            <div>
              Total gas avoided:{" "}
              <b>{Math.round(totalGallons).toLocaleString()} gallons</b>
            </div>
            <div>
              CO&#8322; prevented: <b>{totalCO2.toFixed(1)} metric tons</b>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Equivalency cards with AnimCount */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {metrics.map((c, i) => (
              <div
                key={i}
                style={{
                  background: t.white,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: 14,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.green }}>
                  <AnimCount end={Math.round(c.value)} duration={1400} />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.text,
                    marginTop: 4,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{ fontSize: 11, color: t.textLight, marginTop: 2 }}
                >
                  {c.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Summary banner */}
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: t.greenLight,
              borderRadius: 14,
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: 15, fontWeight: 700, color: t.greenDark }}
            >
              Your switch prevents {totalCO2.toFixed(1)} metric tons of
              CO&#8322;
            </div>
            <div style={{ fontSize: 13, color: t.textMid, marginTop: 6 }}>
              That&apos;s like planting {trees.toLocaleString()} trees and
              letting them grow for {years} years.
            </div>
          </div>

          {/* ShareBadge */}
          <div style={{ marginTop: 16 }}>
            <ShareBadge
              title="Carbon Impact Results"
              value={`${totalCO2.toFixed(1)} metric tons CO\u2082`}
              subtitle={`${miles.toLocaleString()} mi/yr \u00D7 ${years} years`}
              details={[
                { label: "Trees equivalent", value: trees.toLocaleString() },
                {
                  label: "Gallons saved",
                  value: Math.round(totalGallons).toLocaleString(),
                },
                { label: "Flights avoided", value: String(flights) },
              ]}
            />
          </div>
        </div>
      </div>

      {/* --- Equivalency Bar Chart --- */}
      <div
        style={{
          marginTop: 36,
          background: t.white,
          border: `1px solid ${t.borderLight}`,
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: t.text,
            marginBottom: 20,
          }}
        >
          Impact Comparison
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} />
            <XAxis
              dataKey="name"
              tick={{ fill: t.textMid, fontSize: 12 }}
              axisLine={{ stroke: t.borderLight }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: t.textMid, fontSize: 12 }}
              axisLine={{ stroke: t.borderLight }}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
              }
            />
            <Tooltip
              contentStyle={{
                background: t.white,
                border: `1px solid ${t.borderLight}`,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(v) => [Number(v).toLocaleString(), "Value"]}
            />
            <Bar
              dataKey="value"
              fill={t.green}
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- Animated Tree Grid --- */}
      <div
        style={{
          marginTop: 28,
          background: t.white,
          border: `1px solid ${t.borderLight}`,
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: t.text,
            marginBottom: 6,
          }}
        >
          Tree Absorption Grid
        </h2>
        <p
          style={{
            fontSize: 13,
            color: t.textMid,
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          Each tree represents{" "}
          {Math.max(1, Math.round(trees / TOTAL_GRID)).toLocaleString()} real
          trees needed.{" "}
          <b>
            {filledTrees} of {TOTAL_GRID}
          </b>{" "}
          cells filled (
          {trees >= TOTAL_GRID
            ? "100"
            : Math.round((trees / TOTAL_GRID) * 100)}
          %).
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 4,
          }}
        >
          {Array.from({ length: TOTAL_GRID }).map((_, i) => {
            const active = i < filledTrees;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  fontSize: "clamp(14px, 2vw, 22px)",
                  background: active ? t.greenLight : t.card,
                  opacity: active ? 1 : 0.3,
                  transition: `opacity 0.4s ease ${i * 15}ms, background 0.4s ease ${i * 15}ms`,
                }}
              >
                {"\u{1F333}"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
