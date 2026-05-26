const S = ({ w = '100%', h = 16, r = 6, mb = 0, style = {} }: {
  w?: string | number; h?: number; r?: number; mb?: number; style?: React.CSSProperties;
}) => (
  <div
    className="tg-skeleton"
    style={{ width: w, height: h, borderRadius: r, marginBottom: mb, flexShrink: 0, ...style }}
  />
);

const TourDetailSkeleton = () => (
  <>
    {/* ── Breadcrumb ── */}
    <div style={{ background: '#f8f8f8', padding: '14px 0', marginBottom: 0 }}>
      <div className="container">
        <S w={260} h={14} />
      </div>
    </div>

    {/* ── Hero header (title + share) ── */}
    <div className="tg-tour-details-area pt-35 pb-25">
      <div className="container">
        <div className="row align-items-end mb-35">
          <div className="col-xl-9 col-lg-8">
            <S w="70%" h={36} mb={14} />
            <S w="45%" h={14} mb={12} />
            <div className="d-flex gap-3" style={{ gap: 12 }}>
              <S w={100} h={14} />
              <S w={80} h={14} />
              <S w={120} h={14} />
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 text-end">
            <div className="d-flex justify-content-end" style={{ gap: 12 }}>
              <S w={60} h={14} />
              <S w={100} h={14} />
            </div>
          </div>
        </div>

        {/* ── Gallery images ── */}
        <div className="row" style={{ gap: 0, marginBottom: 16 }}>
          <div className="col-lg-8 pr-10">
            <S w="100%" h={450} r={15} mb={0} />
          </div>
          <div className="col-lg-4 pl-10">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 450 }}>
              <S w="100%" h={143} r={15} />
              <S w="100%" h={143} r={15} />
              <S w="100%" h={143} r={15} />
            </div>
          </div>
        </div>

        {/* ── Feature list chips ── */}
        <div className="tg-tour-details-feature-list-wrap mb-30 mt-20">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '30%' }}>
                <S w={36} h={36} r={50} />
                <div style={{ flex: 1 }}>
                  <S w="60%" h={11} mb={6} />
                  <S w="80%" h={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ── Body: content + sidebar ── */}
    <div className="tg-tour-about-area tg-tour-about-border pt-40 pb-70">
      <div className="container">
        <div className="row">
          {/* Left content column */}
          <div className="col-xl-9 col-lg-8">
            <div className="tg-tour-about-wrap mr-55">
              <div className="tg-tour-about-content">

                {/* Section: About */}
                <div className="tg-tour-about-inner mb-40">
                  <S w={200} h={22} mb={16} />
                  <S w="100%" h={13} mb={8} />
                  <S w="100%" h={13} mb={8} />
                  <S w="90%" h={13} mb={8} />
                  <S w="75%" h={13} mb={0} />
                </div>

                <div style={{ height: 1, background: '#e5e7eb', margin: '0 0 32px' }} />

                {/* Section: Highlights */}
                <div className="tg-tour-about-inner mb-40">
                  <S w={180} h={22} mb={16} />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <S w={18} h={18} r={50} />
                      <S w={`${60 + (i % 3) * 10}%`} h={13} />
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: '#e5e7eb', margin: '0 0 32px' }} />

                {/* Section: Tour Plan accordion */}
                <div className="tg-tour-about-inner mb-40">
                  <S w={160} h={22} mb={16} />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <S w={`${40 + i * 8}%`} h={14} />
                      <S w={18} h={18} r={4} />
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: '#e5e7eb', margin: '0 0 32px' }} />

                {/* Section: Included / Excluded */}
                <div className="tg-tour-about-inner mb-40">
                  <S w={220} h={22} mb={16} />
                  <div className="row">
                    <div className="col-lg-5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                          <S w={18} h={18} r={50} />
                          <S w="80%" h={13} />
                        </div>
                      ))}
                    </div>
                    <div className="col-lg-7">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                          <S w={18} h={18} r={50} />
                          <S w="75%" h={13} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: '#e5e7eb', margin: '0 0 32px' }} />

                {/* Section: Pricing table */}
                <div className="tg-tour-about-inner mb-40">
                  <S w={160} h={22} mb={16} />
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                          <S w="70%" h={13} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: '#e5e7eb', margin: '0 0 32px' }} />

                {/* Section: Map */}
                <div className="tg-tour-about-inner mb-40">
                  <S w={120} h={22} mb={16} />
                  <S w="100%" h={320} r={12} />
                </div>

                {/* Section: Reviews */}
                <div className="tg-tour-about-inner mb-40">
                  <S w={140} h={22} mb={24} />
                  <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <S w={80} h={60} r={8} style={{ margin: '0 auto 8px' }} />
                      <S w={60} h={11} style={{ margin: '0 auto' }} />
                    </div>
                    <div style={{ flex: 3 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <S w={80} h={11} />
                          <S w="60%" h={8} r={4} />
                          <S w={30} h={11} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review cards */}
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                      <S w={52} h={52} r={50} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <S w="30%" h={14} mb={8} />
                        <S w="100%" h={12} mb={6} />
                        <S w="85%" h={12} mb={0} />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-xl-3 col-lg-4">
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <S w="60%" h={20} mb={20} />
              <S w="100%" h={44} r={8} mb={12} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <S w={50} h={14} />
                <S w={60} h={14} />
                <S w={60} h={14} />
              </div>
              <div style={{ height: 1, background: '#e5e7eb', marginBottom: 16 }} />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <S w={70} h={13} mb={6} />
                    <S w={100} h={11} />
                  </div>
                  <S w={70} h={34} r={6} />
                </div>
              ))}
              <div style={{ height: 1, background: '#e5e7eb', margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <S w={80} h={14} />
                <S w={80} h={20} />
              </div>
              <S w="100%" h={48} r={8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default TourDetailSkeleton;
