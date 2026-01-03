import React from 'react';

type DivinationAnimationProps = {
  symbol: string;
  label?: string;
  accent?: string;
  accentStrong?: string;
};

const sparkles = [
  { x: '18%', y: '22%', size: '6px', delay: '0s', duration: '4.5s' },
  { x: '78%', y: '18%', size: '4px', delay: '0.6s', duration: '5.2s' },
  { x: '64%', y: '70%', size: '5px', delay: '1.2s', duration: '4.8s' },
  { x: '28%', y: '68%', size: '3px', delay: '0.9s', duration: '5.6s' },
  { x: '50%', y: '32%', size: '7px', delay: '1.6s', duration: '6s' },
  { x: '84%', y: '56%', size: '4px', delay: '0.3s', duration: '4.9s' },
  { x: '12%', y: '52%', size: '5px', delay: '1.9s', duration: '5.4s' }
];

const DivinationAnimation: React.FC<DivinationAnimationProps> = ({
  symbol,
  label,
  accent,
  accentStrong
}) => {
  const labelParts = label ? Array.from(label).filter(Boolean) : [];
  const style = {
    ...(accent ? { ['--anim-accent' as string]: accent } : {}),
    ...(accentStrong ? { ['--anim-accent-strong' as string]: accentStrong } : {})
  } as React.CSSProperties;

  return (
    <div className="divination-animation" style={style} aria-hidden="true">
      <div className="divination-animation__grid" />
      <div className="divination-animation__sweep" />
      <div className="divination-animation__ring divination-animation__ring--outer" />
      <div className="divination-animation__ring divination-animation__ring--inner" />
      <div className="divination-animation__pulse" />
      <div className="divination-animation__core">
        <span className="divination-animation__glyph">{symbol}</span>
        {label && (
          <div className="divination-animation__label">
            {labelParts.map((part, index) => (
              <span className="divination-animation__label-part" key={`${part}-${index}`}>{part}</span>
            ))}
          </div>
        )}
      </div>
      {sparkles.map((sparkle, index) => (
        <span
          key={`${sparkle.x}-${sparkle.y}-${index}`}
          className="divination-animation__sparkle"
          style={
            {
              ['--sparkle-x' as string]: sparkle.x,
              ['--sparkle-y' as string]: sparkle.y,
              ['--sparkle-size' as string]: sparkle.size,
              ['--sparkle-delay' as string]: sparkle.delay,
              ['--sparkle-duration' as string]: sparkle.duration
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default DivinationAnimation;
