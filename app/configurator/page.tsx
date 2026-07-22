<Section title="Blade" desc="Choose from the real blade variants used in the 3D model.">
  <Label>Blade shape</Label>
  <div className="grid grid-cols-1 gap-3 mb-6">
    {BLADE_SHAPES.map(opt => (
      <OptionCard
        key={opt.id}
        active={config.bladeShape === opt.id}
        onClick={() => update('bladeShape', opt.id)}
        title={opt.displayName || opt.name}
        desc={`${opt.name} · ${opt.desc || ''}`}
        priceDelta={opt.price}
        priceFormatter={fmt}
      />
    ))}
  </div>

  <Label>Blade color</Label>
  <div className="grid grid-cols-2 gap-3">
    {BLADE_FINISHES.map(opt => (
      <button
        key={opt.id}
        onClick={() => update('bladeFinish', opt.id)}
        className={`p-3 rounded-md border-2 text-left transition-all duration-200 ${
          config.bladeFinish === opt.id
            ? 'border-[#F9733E] bg-[#F9733E]/5'
            : 'border-border hover:border-foreground/30'
        }`}
      >
        <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: opt.hex || '#54565A' }} />
        <p className="text-sm font-semibold text-foreground">{opt.name}</p>
        {opt.price > 0 && <p className="text-xs text-[#F9733E] font-semibold mt-0.5">+{fmt(opt.price)}</p>}
      </button>
    ))}
  </div>
</Section>
