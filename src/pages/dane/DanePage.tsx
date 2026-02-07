import { DaneHeader, DataPanel, DataPanelStat } from '@/components/dane';
import { useDaneOverview } from '@/hooks/useDaneOverview';
import { DANE_CATEGORIES } from '@/types/dane';
import { LocalizedLink } from '@/components/LocalizedLink';
import { Card, CardContent } from '@/components/ui/card';

export function DanePage() {
  const { airQuality, energy, housing, crime } = useDaneOverview();

  return (
    <div>
      <DaneHeader
        title="Otwarte Dane"
        subtitle="Dane publiczne z polskich źródeł"
        icon="ri-database-2-line"
      />

      {/* Dashboard Panels */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Air Quality Panel */}
        <DataPanel
          title="Jakość powietrza"
          icon="ri-cloud-line"
          href="/dane/srodowisko/powietrze"
          isLive
          source="GIOŚ"
          loading={airQuality.loading}
        >
          {airQuality.nationalAverage && (
            <div className="space-y-4">
              <DataPanelStat
                value={airQuality.nationalAverage.level.toFixed(1)}
                label="Średni wskaźnik krajowy"
                size="lg"
              />
              <p className="text-sm text-muted-foreground">
                Na podstawie {airQuality.nationalAverage.stationCount} stacji pomiarowych
              </p>
              {airQuality.worstStations.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Najgorsze stacje:</p>
                  <div className="space-y-1">
                    {airQuality.worstStations.slice(0, 3).map((station) => (
                      <div
                        key={station.station.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="truncate">{station.station.city.name}</span>
                        <span
                          className="font-medium px-2 py-0.5 rounded text-xs"
                          style={{ backgroundColor: station.indexInfo.color + '20', color: station.indexInfo.color }}
                        >
                          {station.indexInfo.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DataPanel>

        {/* Energy Panel */}
        <DataPanel
          title="Energia"
          icon="ri-flashlight-line"
          href="/dane/ekonomia/energia"
          source="dane.gov.pl"
          loading={energy.loading}
        >
          {energy.energyMix && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DataPanelStat
                  value={`${energy.energyMix.renewables.toFixed(1)}%`}
                  label="OZE"
                  color="#22c55e"
                />
                <DataPanelStat
                  value={`${energy.energyMix.solidFuels.toFixed(1)}%`}
                  label="Węgiel"
                  color="#6b7280"
                />
              </div>
              {energy.electricityPrice && (
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    Cena: <span className="font-semibold">{energy.electricityPrice.householdPrice} zł/MWh</span>
                  </p>
                </div>
              )}
              {energy.comparison && (
                <p className="text-xs text-muted-foreground">
                  UE średnia OZE: {energy.comparison.eu.renewablesShare.toFixed(1)}%
                </p>
              )}
            </div>
          )}
        </DataPanel>

        {/* Housing Panel */}
        <DataPanel
          title="Ceny mieszkań"
          icon="ri-building-line"
          href="/dane/ekonomia/mieszkania"
          source="dane.gov.pl"
          loading={housing.loading}
        >
          {housing.summary?.avgPricePerSqm ? (
            <div className="space-y-4">
              <DataPanelStat
                value={`${housing.summary.avgPricePerSqm.toLocaleString()} zł`}
                label="Średnia cena za m²"
                size="lg"
              />
              {housing.summary.byCity && housing.summary.byCity.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Według miast:</p>
                  <div className="space-y-1">
                    {housing.summary.byCity.slice(0, 3).map((city) => (
                      <div key={city.city} className="flex justify-between text-sm">
                        <span>{city.city}</span>
                        <span className="font-medium">{city.avgPrice.toLocaleString()} zł/m²</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Dane w przygotowaniu</p>
          )}
        </DataPanel>

        {/* Crime Panel */}
        <DataPanel
          title="Przestępczość"
          icon="ri-shield-line"
          href="/dane/bezpieczenstwo/przestepczosc"
          source="Policja"
          loading={crime.loading}
        >
          {crime.summary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DataPanelStat
                  value={`${(crime.solvingRate ?? 0).toFixed(1)}%`}
                  label="Wykrywalność"
                />
                <DataPanelStat
                  value={(crime.totalCrimes ?? 0).toLocaleString()}
                  label="Przestępstwa"
                />
              </div>
              {crime.topRegions && crime.topRegions.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Top regiony:</p>
                  <div className="space-y-1">
                    {crime.topRegions.map((region) => (
                      <div key={region.region} className="flex justify-between text-sm">
                        <span className="truncate">{region.region}</span>
                        <span className="font-medium">{region.reported.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Dane w przygotowaniu</p>
          )}
        </DataPanel>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Kategorie danych</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DANE_CATEGORIES.map((category) => (
            <LocalizedLink key={category.id} to={category.subpages[0]?.path ?? category.path}>
              <Card className="hover:border-foreground/20 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <i className={`${category.icon} text-2xl text-content-subtle`} />
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <div className="space-y-1">
                    {category.subpages.map((subpage) => (
                      <p key={subpage.id} className="text-sm text-muted-foreground">
                        • {subpage.name}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </div>
  );
}
