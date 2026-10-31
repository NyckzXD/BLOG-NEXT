import { Reveal } from "@/components/ui/reveal";

/**
 * `titleId` existe para o `aria-labelledby` da `<section>` que envolve este
 * heading. Uma `<section>` sem nome acessível não é anunciada como região e
 * não aparece na lista de landmarks do leitor de tela — com o nome, as três
 * seções da página passam a ser navegáveis por lá.
 */
export function SectionHeading({
  eyebrow,
  title,
  titleId,
  description,
}: {
  eyebrow: string;
  title: string;
  titleId?: string;
  description?: string;
}) {
  return (
    <Reveal className="mb-14">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2
        id={titleId}
        className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
      >
        {title}
      </h2>
      <div className="mt-3 h-[3px] w-10 rounded-full bg-gradient-to-r from-accent to-accent2" />
      {description && (
        <p className="mt-4 max-w-xl text-[15px] text-muted">{description}</p>
      )}
    </Reveal>
  );
}
