import type { TimelineItem } from "@/lib/timeline";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export function formatItemTime(item: TimelineItem) {
  const start = formatTime(item.displayStartTime);

  if (item.feedingType === "breast" || item.kind === "sleep") {
    if (item.displayEndTime) {
      return `${start}-${formatTime(item.displayEndTime)}`;
    }

    return `${start} 开始`;
  }

  return start;
}

function formatDuration(minutes?: number) {
  if (minutes === undefined) return null;
  if (minutes < 1) return "不足1分钟";

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}分钟`;
  return rest ? `${hours}小时${rest}分钟` : `${hours}小时`;
}

export function bottleContentLabel(value?: TimelineItem["bottleContent"]) {
  if (value === "formula") return "配方奶";
  if (value === "expressed_breast_milk") return "母乳瓶喂";
  if (value === "mixed") return "混合";
  if (value === "other") return "其他";
  return "未指定";
}

export function diaperTypeLabel(value?: TimelineItem["diaperType"]) {
  if (value === "dirty") return "便便";
  if (value === "both") return "尿湿和便便";
  return "尿湿";
}

function stoolColorLabel(value?: TimelineItem["stoolColor"]) {
  if (value === "yellow") return "黄色";
  if (value === "brown") return "棕色";
  if (value === "green") return "绿色";
  if (value === "black") return "黑色";
  if (value === "red") return "红色";
  if (value === "white") return "白色";
  if (value === "other") return "其他";
  if (value === "unknown") return "不确定";
  return "未填写";
}

function stoolConsistencyLabel(value?: TimelineItem["stoolConsistency"]) {
  if (value === "watery") return "水样";
  if (value === "loose") return "偏稀";
  if (value === "soft") return "软便";
  if (value === "formed") return "成形";
  if (value === "hard") return "偏硬";
  if (value === "mucousy") return "黏液";
  if (value === "other") return "其他";
  if (value === "unknown") return "不确定";
  return "未填写";
}

export function getDetailText(item: TimelineItem) {
  if (item.feedingType === "bottle") {
    return bottleContentLabel(item.bottleContent);
  }

  if (item.feedingType === "breast") {
    const duration = formatDuration(item.durationMinutes);

    if (item.displayEndTime) {
      return duration ? `喂养时长 ${duration}` : null;
    }

    return duration ? `进行中 · 已喂${duration}` : "进行中";
  }

  if (item.kind === "diaper") {
    if (item.diaperType === "dirty" || item.diaperType === "both") {
      return `${diaperTypeLabel(item.diaperType)} · ${stoolColorLabel(
        item.stoolColor,
      )} · ${stoolConsistencyLabel(item.stoolConsistency)}`;
    }

    return diaperTypeLabel(item.diaperType);
  }

  return null;
}
