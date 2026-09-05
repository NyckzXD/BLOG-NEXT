import { Reveal } from "@/components/ui/reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mb-14">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <div className="mt-3 h-[3px] w-10 rounded-full bg-gradient-to-r from-accent to-accent2" />
      {description && (
        <p className="mt-4 max-w-xl text-[15px] text-muted">{description}</p>
      )}
    </Reveal>
  );
}
