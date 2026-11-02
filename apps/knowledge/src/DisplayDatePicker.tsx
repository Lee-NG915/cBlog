import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SelectField } from "@cblog/ui";
import {
  fromDisplayInput,
  toDisplayInput,
  normalizeDisplayDate,
} from "./dates";
const pad = (n: number) => String(n).padStart(2, "0");
const datePart = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export function DisplayDatePicker({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
}) {
  const id = useId(),
    [text, setText] = useState(toDisplayInput(value).replace("T", " "));
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const [day, setDay] = useState(""),
    [time, setTime] = useState(""),
    [month, setMonth] = useState(0),
    [year, setYear] = useState(2026),
    [yearText, setYearText] = useState("");
  const opener = useRef<HTMLButtonElement>(null);
  const days = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => setText(toDisplayInput(value).replace("T", " ")), [value]);
  function load(input: string) {
    const [date, clock] = input.split("T");
    setDay(date);
    setTime(clock);
    setYear(Number(date.slice(0, 4)));
    setYearText(date.slice(0, 4));
    setMonth(Number(date.slice(5, 7)) - 1);
    setError("");
  }
  function commitText() {
    if (!text.trim()) {
      setError("");
      if (value) onChange(null);
      return;
    }
    const normal = normalizeDisplayDate(text);
    if (!normal) {
      setError("请输入有效的日期和时间，例如 2026-11-02 20:30。");
      return;
    }
    setText(normal.replace("T", " "));
    setError("");
    if (normal !== toDisplayInput(value)) onChange(fromDisplayInput(normal));
  }
  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setMonth(d.getUTCMonth());
    setYear(d.getUTCFullYear());
    setYearText(String(d.getUTCFullYear()));
  }
  function pickDate(next: string, focus = false) {
    setDay(next);
    setMonth(Number(next.slice(5, 7)) - 1);
    setYear(Number(next.slice(0, 4)));
    setYearText(next.slice(0, 4));
    if (focus) requestAnimationFrame(() => days.current.get(next)?.focus());
  }
  const start = new Date(Date.UTC(year, month, 1));
  start.setUTCDate(1 - ((start.getUTCDay() + 6) % 7));
  const calendar = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });
  return (
    <div className="display-date-field">
      <label htmlFor={id}>发布展示时间</label>
      <div className="date-input-row">
        <input
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="YYYY-MM-DD HH:mm"
          value={text}
          aria-describedby={`${id}-help`}
          aria-invalid={!!error && !open}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText();
            }
          }}
        />
        <button
          ref={opener}
          type="button"
          className="icon-button"
          aria-label="打开日期选择器"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            load(
              normalizeDisplayDate(text) ||
                toDisplayInput(value) ||
                toDisplayInput(new Date().toISOString()),
            );
            setOpen(true);
          }}
        >
          <CalendarDays size={20} />
        </button>
      </div>
      <small id={`${id}-help`}>
        可直接输入日期和时间，或打开日历选择。UTC+8
      </small>
      {error && !open && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setError("");
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup
            className="dialog date-dialog"
            initialFocus={() => days.current.get(day)}
            finalFocus={opener}
          >
            <Dialog.Title>设置发布展示时间</Dialog.Title>
            <Dialog.Description>
              选择日期和时间，再应用到草稿。
            </Dialog.Description>
            <Dialog.Close
              className="dialog-x icon-button"
              aria-label="关闭日期选择器"
            >
              <X size={19} />
            </Dialog.Close>
            <div className="calendar-heading">
              <button
                className="icon-button"
                aria-label="上个月"
                onClick={() => shiftMonth(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <label className="calendar-year">
                <span className="sr-only">选择年份</span>
                <input
                  aria-label="选择年份"
                  inputMode="numeric"
                  maxLength={4}
                  value={yearText}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setYearText(v);
                    if (v.length === 4 && Number(v) >= 1000) setYear(Number(v));
                  }}
                  onBlur={() => setYearText(String(year))}
                />
              </label>
              <SelectField
                aria-label="选择月份"
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                {Array.from({ length: 12 }, (_, m) => (
                  <option value={m} key={m}>
                    {m + 1} 月
                  </option>
                ))}
              </SelectField>
              <button
                className="icon-button"
                aria-label="下个月"
                onClick={() => shiftMonth(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <span className="sr-only" aria-live="polite">
              {year}年{month + 1}月
            </span>
            <div
              className="calendar-grid"
              role="grid"
              aria-label={`${year}年${month + 1}月日历`}
            >
              <div role="row" className="calendar-week">
                {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                  <span role="columnheader" key={d}>
                    {d}
                  </span>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, row) => (
                <div role="row" key={row}>
                  {calendar.slice(row * 7, row * 7 + 7).map((d) => {
                    const key = datePart(d);
                    return (
                      <div
                        role="gridcell"
                        key={key}
                        aria-selected={day === key}
                      >
                        <button
                          ref={(el) => {
                            if (el) days.current.set(key, el);
                            else days.current.delete(key);
                          }}
                          type="button"
                          className={
                            (d.getUTCMonth() !== month ? "outside " : "") +
                            (day === key ? "selected" : "")
                          }
                          tabIndex={
                            day === key ||
                            (!calendar.some((x) => datePart(x) === day) &&
                              d.getUTCDate() === 1 &&
                              d.getUTCMonth() === month)
                              ? 0
                              : -1
                          }
                          aria-label={`${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`}
                          aria-current={
                            key ===
                            toDisplayInput(new Date().toISOString()).slice(
                              0,
                              10,
                            )
                              ? "date"
                              : undefined
                          }
                          onClick={() => pickDate(key)}
                          onKeyDown={(e) => {
                            const shifts: Record<string, number> = {
                              ArrowLeft: -1,
                              ArrowRight: 1,
                              ArrowUp: -7,
                              ArrowDown: 7,
                              Home: -(d.getUTCDay() + 6) % 7,
                              End: 6 - ((d.getUTCDay() + 6) % 7),
                            };
                            if (e.key in shifts) {
                              e.preventDefault();
                              const next = new Date(d);
                              next.setUTCDate(
                                next.getUTCDate() + shifts[e.key],
                              );
                              pickDate(datePart(next), true);
                            }
                            if (e.key === "PageUp" || e.key === "PageDown") {
                              e.preventDefault();
                              const next = new Date(
                                Date.UTC(
                                  d.getUTCFullYear(),
                                  d.getUTCMonth() +
                                    (e.key === "PageUp" ? -1 : 1),
                                  1,
                                ),
                              );
                              next.setUTCDate(
                                Math.min(
                                  d.getUTCDate(),
                                  new Date(
                                    Date.UTC(
                                      next.getUTCFullYear(),
                                      next.getUTCMonth() + 1,
                                      0,
                                    ),
                                  ).getUTCDate(),
                                ),
                              );
                              pickDate(datePart(next), true);
                            }
                          }}
                        >
                          {d.getUTCDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="calendar-shortcuts">
              <button
                onClick={() => load(toDisplayInput(new Date().toISOString()))}
              >
                现在
              </button>
              <button
                onClick={() =>
                  load(
                    toDisplayInput(
                      new Date(Date.now() - 86400000).toISOString(),
                    ),
                  )
                }
              >
                昨天
              </button>
              <span>{day}</span>
            </div>
            <label className="calendar-time">
              时间（24小时制）
              <input
                aria-label="时间（24小时制）"
                inputMode="text"
                placeholder="20:30"
                maxLength={5}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
            {error && open && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <Dialog.Close>取消</Dialog.Close>
              <button
                className="primary"
                onClick={() => {
                  const normal = normalizeDisplayDate(day + "T" + time);
                  if (!normal) {
                    setError("请输入有效的时间，例如 20:30。");
                    return;
                  }
                  if (normal !== toDisplayInput(value))
                    onChange(fromDisplayInput(normal));
                  setText(normal.replace("T", " "));
                  setError("");
                  setOpen(false);
                }}
              >
                应用时间
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
