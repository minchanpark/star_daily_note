import type { CSSProperties } from "react";
import { memo, useMemo } from "react";
import type { StarEntry } from "@/types";
import styles from "./NightSky.module.css";

type StarProps = {
  entry: StarEntry;
  isActive: boolean;
  isHighlighted: boolean;
  onSelect: (entry: StarEntry) => void;
};

type StarStyle = CSSProperties & {
  "--twinkle-offset"?: number;
};

const computeTwinkleOffset = (seed: string) => {
  let sum = 0;
  for (let index = 0; index < seed.length; index += 1) {
    sum += seed.charCodeAt(index);
  }
  return (sum % 8) / 8;
};

const Star = ({ entry, isActive, isHighlighted, onSelect }: StarProps) => {
  const className = useMemo(() => {
    const classes = [styles.star];
    if (isActive) {
      classes.push(styles.starActive);
    }
    if (isHighlighted) {
      classes.push(styles.starHighlighted);
    }
    return classes.join(" ");
  }, [isActive, isHighlighted]);

  const style = useMemo<StarStyle>(() => ({
    left: `${entry.x}%`,
    top: `${entry.y}%`,
    "--twinkle-offset": computeTwinkleOffset(entry.id),
  }), [entry.id, entry.x, entry.y]);

  const label = entry.createdAt
    ? `${entry.createdAt.toLocaleDateString()}의 별무리 일기`
    : "새로운 별무리 일기";

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => onSelect(entry)}
      aria-label={`${label} 재생`}
    >
      <span className={styles.starCore} />
    </button>
  );
};

export default memo(Star);
