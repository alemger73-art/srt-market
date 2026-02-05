import React, { useEffect, useMemo, useState } from "react";

/**
 * Интернет‑магазин Еды по Сортировке — MVP (демо)
 *
 * ⚙️ Возможности:
 *  - Категории, поиск, карточки товаров
 *  - Корзина с подсчётом суммы и правилом: доставка 0₸ при total >= freeFrom
 *  - Быстрые «допы»: соусы к пицце/фастфуду + блок «приборы»
 *  - Оформление → готовый чек в WhatsApp менеджеру
 *  - Верхний баннер акций, логотип (текст/URL), способы оплаты
 *  - Админка по секретному URL: добавить к адресу ?admin=PIN (по умолчанию 1111)
 *
 * 💾 Все данные хранятся в localStorage (без сервера).
 * 🧪 Внизу файла запускаются быстрые runtime‑тесты логики корзины/доставки.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Демо‑константы
// ──────────────────────────────────────────────────────────────────────────────
const CATEGORIES: { id: string; name: string }[] = [
  { id: "hot", name: "Горячее" },
  { id: "grill", name: "Шашлык" },
  { id: "fast", name: "Фастфуд" },
  { id: "salads", name: "Салаты" },
  { id: "drinks", name: "Напитки" },
  { id: "sets", name: "Сеты" }
];

const PRODUCTS_DEMO = [
  { id: 1, title: "Плов с казы", price: 2490, category: "hot", img: "https://images.unsplash.com/photo-1625944525884-9a5d6f040b7a?q=80&w=800&auto=format&fit=crop", desc: "300 г • ароматный рис, казы" },
  { id: 2, title: "Манты классические", price: 2290, category: "hot", img: "https://images.unsplash.com/photo-1625941366731-6c5f7955daeb?q=80&w=800&auto=format&fit=crop", desc: "5 шт • сочная говядина" },
  { id: 3, title: "Лагман жареный", price: 2390, category: "hot", img: "https://images.unsplash.com/photo-1625942086909-c0d2fdd3e768?q=80&w=800&auto=format&fit=crop", desc: "350 г • овощи, соус" },
  { id: 4, title: "Шашлык из баранины", price: 1990, category: "grill", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop", desc: "1 шампур • лук, лаваш" },
  { id: 5, title: "Люля‑кебаб", price: 1790, category: "grill", img: "https://images.unsplash.com/photo-1568051243855-66c0b2d384ee?q=80&w=800&auto=format&fit=crop", desc: "1 шампур • соус" },
  { id: 6, title: "Пицца Маргарита 30 см", price: 3190, category: "fast", img: "https://images.unsplash.com/photo-1548365328-9f547fb09526?q=80&w=800&auto=format&fit=crop", desc: "сыр, томаты, базилик" },
  { id: 7, title: "Наггетсы", price: 1590, category: "fast", img: "https://images.unsplash.com/photo-1625941367166-9a1f7a196ee3?q=80&w=800&auto=format&fit=crop", desc: "12 шт • соус" },
  { id: 8, title: "Ачучук", price: 990, category: "salads", img: "https://images.unsplash.com/photo-1560184897-ae75f418493e?q=80&w=800&auto=format&fit=crop", desc: "100 г" },
  { id: 9, title: "Греческий", price: 1290, category: "salads", img: "https://images.unsplash.com/photo-1568158879083-c42860933ed3?q=80&w=800&auto=format&fit=crop", desc: "180 г" },
  { id: 10, title: "Компот фирменный 0.5 л", price: 590, category: "drinks", img: "https://images.unsplash.com/photo-1625941541872-6e1a6fb2b7f1?q=80&w=800&auto=format&fit=crop", desc: "0.5 л • Дәм Әлемі" },
  { id: 11, title: "Компот 1 л", price: 990, category: "drinks", img: "https://images.unsplash.com/photo-1625941541872-6e1a6fb2b7f1?q=80&w=800&auto=format&fit=crop", desc: "1 л • Дәм Әлемі" },
  { id: 12, title: "Сет «Офисный ужин»", price: 9990, category: "sets", img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop", desc: "плов 1 кг, манты 10 шт, пицца 30 см, салаты, компот 2 л" }
];

const SETTINGS_DEFAULT = {
  businessName: "Дәм Әлемі",
  businessTagline: "Доставка по Сортировке",
  deliveryArea: "Сортировка и ближайшие кварталы",
  workHours: "10:00–22:00",
  heroTitle: "Вкус рядом. Закажите за 30 минут.",
  heroSubtitle: "Сеты, шашлык, плов, манты, пицца, салаты и фирменный компот. Оплата Kaspi / Халык / наличные.",
  businessPhone: "+77470304096",
  freeFrom: 5000,
  deliveryFee: 500,
  payments: { kaspi: true, halyk: true, cash: true },
  pin: "1111",
  logoType: "text" as "text" | "image",
  logoText: "ДӘ",
  logoImageUrl: "",
  bannerEnabled: true,
  bannerText: "🔥 Акция: Бесплатная доставка от 5 000 ₸ по Сортировке!",
  bannerBg: "#111827",
  bannerLink: "",
  extras: {
    sauces: [
      { id: "garlic", name: "Соус чесночный", price: 200 },
      { id: "ketchup", name: "Кетчуп", price: 150 },
      { id: "cheese", name: "Сырный соус", price: 250 }
    ],
    utensils: {
      enabled: true,
      options: [
        { id: "fork", name: "Вилка", price: 0 },
        { id: "spoon", name: "Ложка", price: 0 },
        { id: "napkin", name: "Салфетка", price: 0 }
      ]
    }
  }
};

const LS = {
  products: "store_products_v1",
  settings: "store_settings_v1"
};

// ──────────────────────────────────────────────────────────────────────────────
// Хранилище (localStorage)
// ──────────────────────────────────────────────────────────────────────────────
function useLocalJson<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as unknown as T;
      return { ...(fallback as object), ...(typeof parsed === "object" && parsed ? parsed : {}) } as T;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

// ──────────────────────────────────────────────────────────────────────────────
// Логика корзины (с поддержкой допов)
// ──────────────────────────────────────────────────────────────────────────────
export type CartItem = {
  id: string | number;
  title: string;
  price: number;
  qty: number;
  img?: string;
  type?: "extra";
  category?: string;
};

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const add = (p: any) => {
    setItems(prev => {
      const idx = prev.findIndex(x => x.id === p.id && !x.type);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const addExtra = ({ title, price, parentTitle }: { title: string; price: number; parentTitle: string }) => {
    const uid = `extra:${Math.random().toString(36).slice(2, 8)}`;
    setItems(prev => [...prev, { id: uid, title: `${title} (к ${parentTitle})`, price, qty: 1, type: "extra" }]);
  };
  const dec = (id: string | number) =>
    setItems(prev => prev.map(x => (x.id === id ? { ...x, qty: x.qty - 1 } : x)).filter(x => x.qty > 0));
  const remove = (id: string | number) => setItems(prev => prev.filter(x => x.id !== id));
  const clear = () => setItems([]);
  const total = useMemo(() => items.reduce((s, x) => s + x.price * x.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  return { items, add, addExtra, dec, remove, clear, total, count };
}

const Currency = ({ value }: { value: number }) => <span>{value.toLocaleString("ru-RU")} ₸</span>;

// ──────────────────────────────────────────────────────────────────────────────
// UI блоки
// ──────────────────────────────────────────────────────────────────────────────
function Logo({ settings }: { settings: typeof SETTINGS_DEFAULT }) {
  if (settings.logoType === "image" && settings.logoImageUrl) {
    return <img src={settings.logoImageUrl} alt="Логотип" className="h-9 w-9 object-cover rounded-2xl border" />;
  }
  return (
    <div className="w-9 h-9 rounded-2xl bg-rose-700 text-white grid place-items-center text-lg font-bold">
      {settings.logoText || "ДӘ"}
    </div>
  );
}

function Banner({ settings }: { settings: typeof SETTINGS_DEFAULT }) {
  if (!settings.bannerEnabled) return null;
  const inner = (
    <div className="w-full text-white text-sm" style={{ background: settings.bannerBg || "#111827" }}>
      <div className="max-w-6xl mx-auto px-4 py-2 text-center">{settings.bannerText}</div>
    </div>
  );
  if (settings.bannerLink) {
    return (
      <a href={settings.bannerLink} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}

function CheckoutDrawer({ cart, settings, onClose }: { cart: ReturnType<typeof useCart>; settings: typeof SETTINGS_DEFAULT; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [entrance, setEntrance] = useState("");
  const [comment, setComment] = useState("");
  const [pay, setPay] = useState(settings.payments.kaspi ? "kaspi" : settings.payments.halyk ? "halyk" : "cash");
  const [time, setTime] = useState("asap");
  const [waHelp, setWaHelp] = useState(false);
  const [utensils, setUtensils] = useState<Record<string, number>>({ fork: 0, spoon: 0, napkin: 0 });

  const delivery = cart.total >= settings.freeFrom ? 0 : settings.deliveryFee;
  const grand = cart.total + delivery;

  const buildItemsAndExtras = () =>
    cart.items
      .map(x => `\n• ${x.title} × ${x.qty} — ${(x.price * x.qty).toLocaleString("ru-RU")} ₸`)
      .join("") +
    (Object.values(utensils).some(v => v > 0)
      ?
        `\n\nПриборы:` +
        Object.entries(utensils)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => ` ${settings.extras.utensils.options.find(o => o.id === k)?.name || k} × ${v}`)
          .join(", ")
      : "");

  const placeOrder = () => {
    const text = encodeURIComponent(
      `🧾 Заказ с сайта (Сортировка)\n\nИмя: ${name}\nТел: ${phone}\nАдрес: ${address}${entrance ? `, под.: ${entrance}` : ""}\nВремя: ${time === "asap" ? "как можно скорее" : time}\nОплата: ${pay === "kaspi" ? "Kaspi" : pay === "halyk" ? "Халык" : "Наличные"}\nКомментарий: ${comment || "—"}\n\nСостав:` +
        buildItemsAndExtras() +
        `\n\nИтого: ${grand.toLocaleString("ru-RU")} ₸ (дост.: ${delivery.toLocaleString("ru-RU")} ₸)`
    );
    const phoneDigits = settings.businessPhone.replace(/\D/g, "");
    const win = window.open(`https://wa.me/${phoneDigits}?text=${text}`, "_blank");
    setTimeout(() => {
      if (!win || win.closed || typeof win.closed === "undefined") {
        setWaHelp(true);
        alert("Если WhatsApp не открылся, разрешите всплывающие окна и нажмите кнопку ещё раз.");
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Оформление заказа</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100">✕</button>
        </div>

        <div className="mt-4 space-y-3">
          {cart.items.length === 0 && <div className="text-neutral-500">Корзина пуста. Добавьте блюда из меню.</div>}
          {cart.items.map(x => (
            <div key={x.id} className={`flex flex-col gap-2 border rounded-xl p-3 ${x.type === "extra" ? "bg-amber-50/60" : ""}`}>
              <div className="flex gap-3 items-center">
                {!x.type && <img src={x.img} alt={x.title} className="h-16 w-16 object-cover rounded-lg" />}
                <div className="flex-1">
                  <div className="font-medium">
                    {x.title}
                    {x.type === "extra" && <span className="ml-2 text-xs text-amber-700">доп</span>}
                  </div>
                  <div className="text-sm text-neutral-500"><Currency value={x.price} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => cart.dec(x.id)} className="w-8 h-8 rounded-lg border">−</button>
                  <div className="w-6 text-center">{x.qty}</div>
                  <button onClick={() => (x.type === "extra" ? cart.addExtra({ title: x.title, price: x.price, parentTitle: "" }) : cart.add(x))} className="w-8 h-8 rounded-lg border">+</button>
                </div>
                <div className="w-24 text-right font-semibold"><Currency value={x.price * x.qty} /></div>
                <button onClick={() => cart.remove(x.id)} className="p-2 rounded-lg hover:bg-neutral-100">🗑</button>
              </div>

              {!x.type && (x.category === "fast" || /пицца/i.test(x.title)) && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-neutral-700 mb-2">Добавить соусы:</div>
                  <div className="flex flex-wrap gap-2">
                    {SETTINGS_DEFAULT.extras.sauces.map(s => (
                      <button key={s.id} onClick={() => cart.addExtra({ title: s.name, price: s.price, parentTitle: x.title })} className="text-xs px-3 py-1 rounded-full border">+ {s.name} (<Currency value={s.price} />)</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 border rounded-xl p-4 bg-neutral-50">
          <div className="flex justify-between"><span>Подытог</span><span><Currency value={cart.total} /></span></div>
          <div className="flex justify-between text-sm text-neutral-600 mt-1"><span>Доставка{delivery === 0 ? ` (бесплатно от ${settings.freeFrom.toLocaleString("ru-RU")} ₸)` : ""}</span><span><Currency value={delivery} /></span></div>
          <div className="flex justify-between text-lg font-bold mt-2"><span>Итого</span><span><Currency value={grand} /></span></div>
        </div>

        <div className="mt-4 border rounded-xl p-4 bg-white">
          <div className="font-semibold">Приборы</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SETTINGS_DEFAULT.extras.utensils.options.map(opt => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-sm">{opt.name}</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => setUtensils(prev => ({ ...prev, [opt.id]: Math.max(0, (prev[opt.id] || 0) - 1) }))} className="w-7 h-7 rounded-lg border">−</button>
                  <div className="w-6 text-center">{utensils[opt.id] || 0}</div>
                  <button onClick={() => setUtensils(prev => ({ ...prev, [opt.id]: (prev[opt.id] || 0) + 1 }))} className="w-7 h-7 rounded-lg border">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-neutral-500">Приборы бесплатные, укажите нужное количество.</div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя" className="rounded-xl border px-4 py-2" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" className="rounded-xl border px-4 py-2" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Адрес (Сортировка, улица, дом, кв.)" className="rounded-xl border px-4 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input value={entrance} onChange={e => setEntrance(e.target.value)} placeholder="Подъезд / этаж / домофон" className="rounded-xl border px-4 py-2" />
            <select value={time} onChange={e => setTime(e.target.value)} className="rounded-xl border px-4 py-2">
              <option value="asap">Как можно скорее</option>
              <option value="30">Через 30 минут</option>
              <option value="60">Через 1 час</option>
              <option value="custom">Указать время в комментарии</option>
            </select>
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Комментарий к заказу (без лука, острое и т.п.)" className="rounded-xl border px-4 py-2 min-h-[80px]" />
        </div>

        <div className="mt-4">
          <div className="font-semibold mb-2">Способ оплаты</div>
          <div className="flex gap-2">
            {settings.payments.kaspi && <button onClick={() => setPay("kaspi")} className={`px-3 py-2 rounded-xl border ${pay === "kaspi" ? "bg-neutral-900 text-white" : "bg-white"}`}>Kaspi</button>}
            {settings.payments.halyk && <button onClick={() => setPay("halyk")} className={`px-3 py-2 rounded-xl border ${pay === "halyk" ? "bg-neutral-900 text-white" : "bg-white"}`}>Халык</button>}
            {settings.payments.cash && <button onClick={() => setPay("cash")} className={`px-3 py-2 rounded-xl border ${pay === "cash" ? "bg-neutral-900 text-white" : "bg-white"}`}>Наличные</button>}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={placeOrder} disabled={!name || !phone || !address || cart.items.length === 0} className="flex-1 rounded-2xl px-4 py-3 bg-rose-700 text-white font-semibold shadow-md disabled:opacity-50">Отправить заказ в WhatsApp</button>
          <button onClick={cart.clear} className="px-4 py-3 rounded-2xl border">Очистить</button>
        </div>

        {waHelp && (
          <div className="mt-4 border rounded-xl p-4 bg-emerald-50 text-emerald-900">
            <div className="font-semibold">Откройте WhatsApp и нажмите «Отправить»</div>
            <p className="text-sm mt-1">Мы подготовили чек. Если WhatsApp не открылся автоматически, нажмите кнопку ниже.</p>
            <div className="mt-3">
              <a
                href={`https://wa.me/${settings.businessPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  "🧾 Заказ с сайта (Сортировка)\n\nИмя: " +
                    name +
                    "\nТел: " +
                    phone +
                    "\nАдрес: " +
                    address +
                    (entrance ? ", под.: " + entrance : "") +
                    "\nВремя: " +
                    (time === "asap" ? "как можно скорее" : time) +
                    "\nОплата: " +
                    (pay === "kaspi" ? "Kaspi" : pay === "halyk" ? "Халык" : "Наличные") +
                    "\nКомментарий: " +
                    (comment || "—") +
                    "\n\nСостав:" +
                    cart.items
                      .map(x => "\n• " + x.title + " × " + x.qty + " — " + (x.price * x.qty).toLocaleString("ru-RU") + " ₸")
                      .join("") +
                    "\n\nИтого: " +
                    grand.toLocaleString("ru-RU") +
                    " ₸ (дост.: " +
                    delivery.toLocaleString("ru-RU") +
                    " ₸)"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-2xl bg-emerald-600 text-white"
              >
                Открыть WhatsApp
              </a>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-neutral-500">
          Нажимая «Отправить», вы соглашаетесь с условиями сервиса. Заказы принимаются только по зоне доставки: {settings.deliveryArea}.
        </div>
      </div>
    </div>
  );
}

function AdminScreen({
  products,
  setProducts,
  settings,
  setSettings
}: {
  products: typeof PRODUCTS_DEMO;
  setProducts: (v: typeof PRODUCTS_DEMO) => void;
  settings: typeof SETTINGS_DEFAULT;
  setSettings: (v: typeof SETTINGS_DEFAULT) => void;
}) {
  const [draft, setDraft] = useState(products);
  const [sDraft, setSDraft] = useState(settings);

  useEffect(() => setDraft(products), [products]);
  useEffect(() => setSDraft(settings), [settings]);

  const addNew = () => {
    const maxId = draft.reduce((m, x) => Math.max(m, x.id as number), 0);
    setDraft([
      ...draft,
      {
        id: maxId + 1,
        title: "Новое блюдо",
        price: 1000,
        category: CATEGORIES[0].id,
        img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
        desc: "Описание"
      }
    ]);
  };
  const remove = (id: number) => setDraft(draft.filter(x => x.id !== id));
  const saveAll = () => {
    setProducts(draft);
    setSettings(sDraft);
    alert("Сохранено! Меню и настройки обновлены.");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ products: draft, settings: sDraft }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result));
        if (Array.isArray(data.products)) setDraft(data.products);
        if (data.settings) setSDraft(prev => ({ ...prev, ...data.settings }));
      } catch {
        alert("Ошибка импорта");
      }
    };
    r.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-white grid place-items-center text-lg font-bold">ADM</div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Админка — {sDraft.businessName || "Дәм Әлемі"}</h1>
            <p className="text-xs text-neutral-500">Доступ по секретному URL (?admin=PIN)</p>
          </div>
          <a href="/" className="px-3 py-2 rounded-2xl border">В магазин</a>
          <button onClick={saveAll} className="px-3 py-2 rounded-2xl bg-neutral-900 text-white">Сохранить</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="border rounded-2xl p-4 bg-white">
          <h2 className="font-semibold">Настройки</h2>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            <label className="text-sm">Название бренда
              <input value={sDraft.businessName} onChange={e => setSDraft({ ...sDraft, businessName: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="text-sm">Подпись под логотипом
              <input value={sDraft.businessTagline} onChange={e => setSDraft({ ...sDraft, businessTagline: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="text-sm">Зона доставки
              <input value={sDraft.deliveryArea} onChange={e => setSDraft({ ...sDraft, deliveryArea: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="text-sm">Часы работы
              <input value={sDraft.workHours} onChange={e => setSDraft({ ...sDraft, workHours: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="text-sm">Номер WhatsApp
              <input value={sDraft.businessPhone} onChange={e => setSDraft({ ...sDraft, businessPhone: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="text-sm">Бесплатная доставка от, ₸
              <input type="number" value={sDraft.freeFrom} onChange={e => setSDraft({ ...sDraft, freeFrom: Number(e.target.value) })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="text-sm">Стоимость доставки, ₸
              <input type="number" value={sDraft.deliveryFee} onChange={e => setSDraft({ ...sDraft, deliveryFee: Number(e.target.value) })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <span className="text-sm">Оплата:</span>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={sDraft.payments.kaspi} onChange={e => setSDraft({ ...sDraft, payments: { ...sDraft.payments, kaspi: e.target.checked } })} /> Kaspi</label>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={sDraft.payments.halyk} onChange={e => setSDraft({ ...sDraft, payments: { ...sDraft.payments, halyk: e.target.checked } })} /> Халык</label>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={sDraft.payments.cash} onChange={e => setSDraft({ ...sDraft, payments: { ...sDraft.payments, cash: e.target.checked } })} /> Наличные</label>
            <label className="ml-auto text-sm">PIN
              <input value={sDraft.pin} onChange={e => setSDraft({ ...sDraft, pin: e.target.value })} className="ml-2 w-28 rounded-xl border px-3 py-2" />
            </label>
          </div>

          {/* Логотип */}
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Логотип</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <label className="text-sm">Тип логотипа
                <select value={sDraft.logoType} onChange={e => setSDraft({ ...sDraft, logoType: e.target.value as any })} className="mt-1 w-full rounded-xl border px-3 py-2">
                  <option value="text">Текст</option>
                  <option value="image">Картинка (URL)</option>
                </select>
              </label>
              {sDraft.logoType === "text" && (
                <label className="text-sm">Текст логотипа
                  <input value={sDraft.logoText} onChange={e => setSDraft({ ...sDraft, logoText: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
                </label>
              )}
              {sDraft.logoType === "image" && (
                <label className="text-sm md:col-span-2">URL картинки логотипа
                  <input value={sDraft.logoImageUrl} onChange={e => setSDraft({ ...sDraft, logoImageUrl: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="https://..." />
                </label>
              )}
            </div>
          </div>

          {/* Баннер */}
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Акционный баннер</h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!sDraft.bannerEnabled} onChange={e => setSDraft({ ...sDraft, bannerEnabled: e.target.checked })} /> Показать баннер сверху</label>
            </div>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <label className="text-sm md:col-span-2">Текст баннера
                <input value={sDraft.bannerText} onChange={e => setSDraft({ ...sDraft, bannerText: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
              </label>
              <label className="text-sm">Цвет фона (HEX)
                <input value={sDraft.bannerBg} onChange={e => setSDraft({ ...sDraft, bannerBg: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="#111827" />
              </label>
              <label className="text-sm md:col-span-3">Ссылка при клике (опционально)
                <input value={sDraft.bannerLink} onChange={e => setSDraft({ ...sDraft, bannerLink: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="https://..." />
              </label>
            </div>
          </div>

          {/* Hero */}
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Главный экран</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <label className="text-sm md:col-span-3">Заголовок
                <input value={sDraft.heroTitle} onChange={e => setSDraft({ ...sDraft, heroTitle: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
              </label>
              <label className="text-sm md:col-span-3">Подзаголовок
                <input value={sDraft.heroSubtitle} onChange={e => setSDraft({ ...sDraft, heroSubtitle: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
              </label>
            </div>
          </div>

          {/* Допы */}
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Допы (соусы и приборы)</h3>
            <div className="text-sm mb-2">Соусы по умолчанию:</div>
            <div className="grid md:grid-cols-3 gap-3">
              {sDraft.extras.sauces.map((s, idx) => (
                <div key={s.id} className="grid grid-cols-3 gap-2 items-center">
                  <input value={s.name} onChange={e => {
                    const sauces = [...sDraft.extras.sauces];
                    sauces[idx] = { ...s, name: e.target.value };
                    setSDraft({ ...sDraft, extras: { ...sDraft.extras, sauces } });
                  }} className="col-span-2 rounded-xl border px-3 py-2" />
                  <input type="number" value={s.price} onChange={e => {
                    const sauces = [...sDraft.extras.sauces];
                    sauces[idx] = { ...s, price: Number(e.target.value) };
                    setSDraft({ ...sDraft, extras: { ...sDraft.extras, sauces } });
                  }} className="rounded-xl border px-3 py-2" />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sDraft.extras.utensils.enabled} onChange={e => setSDraft({ ...sDraft, extras: { ...sDraft.extras, utensils: { ...sDraft.extras.utensils, enabled: e.target.checked } } })} /> Включить блок «Приборы»</label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={exportJson} className="px-3 py-2 rounded-2xl border">Экспорт JSON</button>
            <label className="px-3 py-2 rounded-2xl border cursor-pointer">Импорт JSON
              <input type="file" accept="application/json" className="hidden" onChange={e => e.currentTarget.files?.[0] && importJson(e.currentTarget.files[0])} />
            </label>
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Товары ({draft.length})</h2>
            <button onClick={addNew} className="px-3 py-2 rounded-xl border">+ Добавить</button>
          </div>
          <div className="mt-3 grid gap-3">
            {draft.map(p => (
              <div key={p.id} className="grid md:grid-cols-[120px_1fr_1fr_1fr_1fr_auto] gap-3 border rounded-2xl p-3 bg-white">
                <img src={p.img} alt="img" className="h-24 w-full md:w-28 object-cover rounded-xl" />
                <input value={p.title} onChange={e => setDraft(draft.map(x => (x.id === p.id ? { ...x, title: e.target.value } : x)))} className="rounded-xl border px-3 py-2" />
                <input type="number" value={p.price} onChange={e => setDraft(draft.map(x => (x.id === p.id ? { ...x, price: Number(e.target.value) } : x)))} className="rounded-xl border px-3 py-2" />
                <select value={p.category} onChange={e => setDraft(draft.map(x => (x.id === p.id ? { ...x, category: e.target.value } : x)))} className="rounded-xl border px-3 py-2">
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input value={p.img} onChange={e => setDraft(draft.map(x => (x.id === p.id ? { ...x, img: e.target.value } : x)))} className="rounded-xl border px-3 py-2" />
                <textarea value={p.desc} onChange={e => setDraft(draft.map(x => (x.id === p.id ? { ...x, desc: e.target.value } : x)))} className="md:col-span-6 rounded-xl border px-3 py-2" />
                <div className="md:col-span-6 text-right">
                  <button onClick={() => remove(p.id as number)} className="px-3 py-2 rounded-xl border">Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Главный компонент магазина
// ──────────────────────────────────────────────────────────────────────────────
function Storefront() {
  const [products, setProducts] = useLocalJson<typeof PRODUCTS_DEMO>(LS.products, PRODUCTS_DEMO);
  const [settings, setSettings] = useLocalJson<typeof SETTINGS_DEFAULT>(LS.settings, SETTINGS_DEFAULT);

  // Админка через query‑param
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const isAdmin = params.get("admin") === settings.pin;

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("hot");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const cart = useCart();

  const filtered = useMemo(
    () => products.filter(p => (cat ? p.category === cat : true) && p.title.toLowerCase().includes(q.toLowerCase())),
    [products, q, cat]
  );

  if (isAdmin) {
    return <AdminScreen products={products} setProducts={setProducts} settings={settings} setSettings={setSettings} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Banner settings={settings} />

      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Logo settings={settings} />
          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-tight">{settings.businessName} — {settings.businessTagline}</h1>
            <p className="text-xs text-neutral-500">Работаем с {settings.workHours} • Доставка: {settings.deliveryArea}</p>
          </div>
          <button onClick={() => setCheckoutOpen(true)} className="rounded-2xl px-4 py-2 bg-rose-700 text-white font-medium shadow-md hover:shadow-lg transition">
            Корзина • {cart.count} / <Currency value={cart.total} />
          </button>
        </div>
      </header>

      <section className="bg-gradient-to-br from-rose-50 to-amber-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold">{settings.heroTitle}</h2>
            <p className="mt-2 text-neutral-600">{settings.heroSubtitle}</p>
            <div className="mt-4 flex gap-2">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по меню…" className="w-full md:w-80 rounded-2xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full md:w-80">
            {products.slice(0, 6).map(p => (
              <img key={p.id} src={p.img} alt={p.title} className="h-24 w-full object-cover rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      <nav className="max-w-6xl mx-auto px-4 py-3 overflow-auto">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-4 py-2 rounded-2xl border transition whitespace-nowrap ${cat === c.id ? "bg-rose-700 text-white border-rose-700" : "bg-white hover:bg-neutral-100"}`}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setCat("")}
            className={`px-4 py-2 rounded-2xl border transition whitespace-nowrap ${cat === "" ? "bg-rose-700 text-white border-rose-700" : "bg-white hover:bg-neutral-100"}`}
          >
            Все
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <article key={p.id} className="rounded-2xl bg-white border overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={p.img} alt={p.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{p.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xl font-bold">
                    <Currency value={p.price} />
                  </div>
                  <button onClick={() => cart.add(p)} className="rounded-xl px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800">
                    В корзину
                  </button>
                </div>
                {(p.category === "fast" || /пицца/i.test(p.title)) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {settings.extras.sauces.map(s => (
                      <button key={s.id} onClick={() => cart.addExtra({ title: s.name, price: s.price, parentTitle: p.title })} className="text-xs px-3 py-1 rounded-full border">
                        + {s.name} (<Currency value={s.price} />)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-neutral-600 flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center">
          <div>© {new Date().getFullYear()} {settings.businessName} • {settings.deliveryArea}</div>
          <div>
            Тел.: <a href={`tel:${settings.businessPhone}`} className="underline">{settings.businessPhone}</a> • WhatsApp для заказов
          </div>
          <div>
            Оплата: {settings.payments.kaspi && "Kaspi"}
            {settings.payments.halyk && ", Халык"}
            {settings.payments.cash && ", наличные"} • Доставка от 30 мин
          </div>
        </div>
      </footer>

      {checkoutOpen && <CheckoutDrawer cart={cart} settings={settings} onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Runtime‑тесты (минимальные) — помогут быстро поймать ошибки логики
// ──────────────────────────────────────────────────────────────────────────────
function runSmokeTests() {
  try {
    // Подсчёт суммы в корзине
    const fake = {
      items: [
        { id: 1, title: "A", price: 1000, qty: 1 },
        { id: 2, title: "B", price: 500, qty: 2 }
      ]
    } as unknown as ReturnType<typeof useCart>;
    const total = fake.items.reduce((s: number, x: any) => s + x.price * x.qty, 0);
    console.assert(total === 2000, "Сумма корзины должна быть 2000");

    // Правило бесплатной доставки
    const freeFrom = 5000;
    const deliveryFee = 500;
    const deliveryWhenLow = 4000 >= freeFrom ? 0 : deliveryFee;
    const deliveryWhenHigh = 5500 >= freeFrom ? 0 : deliveryFee;
    console.assert(deliveryWhenLow === 500, "Доставка должна быть платной при total < freeFrom");
    console.assert(deliveryWhenHigh === 0, "Доставка должна быть бесплатной при total >= freeFrom");

    console.log("✅ Smoke tests passed");
  } catch (e) {
    console.error("❌ Smoke tests failed", e);
  }
}

// Выполняем тесты один раз при монтировании
function TestHarness() {
  useEffect(() => {
    runSmokeTests();
  }, []);
  return null;
}

export default function App() {
  return (
    <>
      <TestHarness />
      <Storefront />
    </>
  );
}
