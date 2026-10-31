"use client";

import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * O botão trazia uma paleta inteira própria: ~46 variáveis `--ic-*`, uma
 * segunda camada mapeando cada uma para um `--color-*`, e valores que não
 * eram os do site — `#f6f3ec` (creme quente) sobre `#111111`, enquanto a
 * página é `#f5f5f5` neutro sobre `#000000`. Os CTAs principais puxavam para
 * o quente num site frio.
 *
 * Das 46, o componente usava sete. As outras — `--ic-chart-1..5`,
 * `--ic-destructive`, `--ic-brand`, `--ic-paper`, `--ic-popover-foreground` e
 * companhia — vinham do kit de origem e nada no projeto lia. O
 * `--ic-ring` ficou órfão quando o anel de foco saiu no item 1.
 *
 * Agora são duas listas curtas de classes com os tokens do próprio site, sem
 * camada de variável no meio: não havia reuso que justificasse a indireção.
 */
const lightThemeClassName = "bg-accent2 text-bg border-accent";

const darkThemeClassName = "bg-bg3 text-text-main border-border";

// The fill is animated with a CSS transition rather than Framer Motion: Framer
// writes its own inline `transform`, which silently overrode the Tailwind
// `-translate-x-1/2 -translate-y-1/2` used to centre the circle on the cursor,
// leaving it anchored by its top-left corner. Owning the whole transform string
// here keeps the centring and the scale in one place. Same duration/easing as
// the button's text-colour transition so the two stay in step.
const FILL_DURATION = 0.5;
const FILL_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

type ButtonHTMLAttributesForMotion = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onAnimationStart"
  | "onDrag"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDragStart"
  | "onDrop"
>;

// Sized to exactly reach the farthest corner, the circle only covers that
// corner at scale 1 — the very end of FILL_EASE's slow tail. A small overshoot
// gets the corners covered a bit earlier, so a hover that ends early still
// reads as a complete fill.
const COVER_OVERSHOOT = 1.15;

function getCoverDiameter(width: number, height: number, x: number, y: number) {
  return Math.ceil(
    2 *
      COVER_OVERSHOOT *
      Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y)
      )
  );
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

function hasTextContent(node: React.ReactNode): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).trim().length > 0;
  }

  if (Array.isArray(node)) {
    return node.some(hasTextContent);
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return hasTextContent(node.props.children);
  }

  return false;
}

type OriginButtonProps = ButtonHTMLAttributesForMotion & {
  children?: React.ReactNode;
  loading?: boolean;
  /** Visual theme, independent of the page's own dark/light state. Defaults to "dark". */
  variant?: "light" | "dark";
  /** When set, renders an <a> instead of a <button> (e.g. for navigation or mailto links). */
  href?: string;
  target?: string;
  rel?: string;
};

const OriginButton = React.forwardRef<HTMLButtonElement, OriginButtonProps>(
  (
    {
      children,
      className,
      disabled = false,
      loading = false,
      variant = "dark",
      href,
      target,
      rel,
      type = "button",
      onBlur,
      onClick,
      onFocus,
      onKeyDown,
      onKeyUp,
      onPointerCancel,
      onPointerDown,
      onPointerEnter,
      onPointerLeave,
      onPointerUp,
      ...props
    },
    ref
  ) => {
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const isLight = variant === "light";
    const MotionTag = (href ? motion.a : motion.button) as any;
    const isDisabled = Boolean(disabled || loading);
    const [hovered, setHovered] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);
    const [origin, setOrigin] = React.useState({ x: 0, y: 0 });
    const [coverSize, setCoverSize] = React.useState(0);

    const ariaLabel = props["aria-label"];
    const ariaLabelledBy = props["aria-labelledby"];

    React.useEffect(() => {
      if (process.env.NODE_ENV === "production") {
        return;
      }

      if (
        hasTextContent(children) ||
        ariaLabel?.trim() ||
        ariaLabelledBy?.trim()
      ) {
        return;
      }

      console.warn(
        "OriginButton: provide visible label text or aria-label / aria-labelledby so the control has an accessible name."
      );
    }, [ariaLabel, ariaLabelledBy, children]);

    const updateOrigin = React.useCallback((x: number, y: number) => {
      const node = buttonRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      setOrigin({ x, y });
      setCoverSize(getCoverDiameter(rect.width, rect.height, x, y));
    }, []);

    const updateOriginFromPointer = React.useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        updateOrigin(event.clientX - rect.left, event.clientY - rect.top);
      },
      [updateOrigin]
    );

    const updateOriginFromCenter = React.useCallback(() => {
      const node = buttonRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      updateOrigin(rect.width / 2, rect.height / 2);
    }, [updateOrigin]);

    const showFill = !isDisabled && (hovered || isPressed);

    React.useLayoutEffect(() => {
      const node = buttonRef.current;
      if (!(node && showFill)) return;

      const measure = () => {
        const rect = node.getBoundingClientRect();
        setCoverSize(
          getCoverDiameter(rect.width, rect.height, origin.x, origin.y)
        );
      };

      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(node);

      const fonts = document.fonts;
      if (fonts?.ready) {
        fonts.ready.then(measure).catch(() => undefined);
      }

      return () => observer.disconnect();
    }, [showFill, origin.x, origin.y]);

    const setMergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        assignRef(ref, node);
      },
      [ref]
    );

    return (
      <MotionTag
        {...props}
        href={href}
        target={target}
        rel={rel}
        aria-busy={loading || undefined}
        aria-disabled={href && isDisabled ? true : undefined}
        className={cn(
          "relative inline-flex h-12 cursor-pointer touch-manipulation select-none items-center justify-center overflow-hidden rounded-xl px-8 font-medium text-base tracking-[-0.02em]",
          "border-[0.5px]",
          isLight ? lightThemeClassName : darkThemeClassName,
          // Kept in sync with FILL_DURATION/FILL_EASE so the text color and the
          // circular fill finish transitioning together instead of the text
          // flipping color before the fill has visually caught up.
          "transition-[color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          // O foco fica por conta do :focus-visible global (globals.css), que
          // desenha o outline 3px fora do botão — então ele contrasta com o
          // fundo da página, não com o preenchimento do botão. O ring que
          // havia aqui usava --ic-ring a 16-18% de opacidade: media 1,41:1 na
          // variante light e 1,70:1 na dark, abaixo do 3:1 que o WCAG pede
          // para indicador de foco. O ring-offset também apontava para
          // --color-background (#111111), que não é o fundo real da página.
          "disabled:pointer-events-none disabled:opacity-50",
          href && isDisabled && "pointer-events-none opacity-50",
          // A cor do texto enquanto o preenchimento cobre o botão. Antes o
          // lado escuro usava `text-neutral-950`, um valor do Tailwind
          // padrão que não existe na paleta do site.
          showFill && (isLight ? "text-accent2" : "text-bg"),
          className
        )}
        data-pressed={isPressed ? "true" : "false"}
        disabled={href ? undefined : isDisabled}
        onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
          onBlur?.(event);
          setIsPressed(false);
          if (!event.defaultPrevented) {
            setHovered(false);
          }
        }}
        onClick={onClick}
        onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
          onFocus?.(event);
          if (isDisabled || event.defaultPrevented) return;
          if (event.currentTarget.matches(":focus-visible")) {
            updateOriginFromCenter();
            setHovered(true);
          }
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);

          if (
            event.defaultPrevented ||
            isDisabled ||
            event.repeat ||
            (event.key !== " " && event.key !== "Enter")
          ) {
            return;
          }

          if (event.key === " ") {
            event.preventDefault();
          }

          updateOriginFromCenter();
          setIsPressed(true);
          setHovered(true);
        }}
        onKeyUp={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyUp?.(event);

          if (event.key === " " || event.key === "Enter") {
            setIsPressed(false);
            if (!event.currentTarget.matches(":focus-visible")) {
              setHovered(false);
            }
          }
        }}
        onPointerCancel={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerCancel?.(event);
          setIsPressed(false);
        }}
        onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerDown?.(event);

          if (event.defaultPrevented || isDisabled || event.button !== 0) {
            return;
          }

          updateOriginFromPointer(event);
          setIsPressed(true);
          setHovered(true);
        }}
        onPointerEnter={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerEnter?.(event);
          if (isDisabled || event.defaultPrevented) return;
          updateOriginFromPointer(event);
          setHovered(true);
        }}
        onPointerLeave={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerLeave?.(event);
          setHovered(false);
          setIsPressed(false);
        }}
        onPointerUp={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerUp?.(event);
          setIsPressed(false);
        }}
        ref={setMergedRef}
        type={href ? undefined : type}
        whileTap={isDisabled ? undefined : { scale: 0.985 }}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute rounded-full",
            // Mesma história do `bg-neutral-50` que estava aqui.
            isLight ? "bg-bg" : "bg-accent2"
          )}
          style={{
            height: coverSize,
            left: origin.x,
            top: origin.y,
            width: coverSize,
            transform: `translate(-50%, -50%) scale(${
              showFill && coverSize > 0 ? 1 : 0
            })`,
            transition: `transform ${FILL_DURATION}s ${FILL_EASE}`,
            willChange: "transform",
          }}
        />
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </MotionTag>
    );
  }
);
OriginButton.displayName = "OriginButton";

export { OriginButton };
export type { OriginButtonProps };
