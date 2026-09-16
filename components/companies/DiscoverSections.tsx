import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ContentColumn } from '@components/ui/ContentColumn';
import { HorizontalRail } from '@components/ui/HorizontalRail';
import { SectionHeader } from '@components/ui/SectionHeader';
import { TOP_RATED_MIN_REVIEWS } from '@constants/companies';
import { spacing } from '@constants/theme';
import type { CompanyExplorerState } from '@hooks/useCompanyExplorer';
import { useSectorPhotos } from '@hooks/useSectorPhotos';
import { nafSectionFromCode } from '@utils/naf';
import type { Company, NafSection } from '@app-types/domain';

import { CityChips } from './CityChips';
import { FeaturedCompanyCard } from './FeaturedCompanyCard';
import { SectorCard } from './SectorCard';
import { ShareReviewBanner } from './ShareReviewBanner';

export interface DiscoverSectionsProps {
  explorer: CompanyExplorerState;
  onOpenCompany: (company: Company) => void;
}

const styles = StyleSheet.create({
  sections: { gap: spacing.xl, paddingBottom: spacing.md },
  section: { gap: spacing.md },
});

/** Accueil sans recherche : secteurs, mieux notées, incitation à publier, villes, puis les plus commentées. */
export function DiscoverSections({ explorer, onOpenCompany }: DiscoverSectionsProps) {
  const { t } = useTranslation('companies');
  const { sectors, cities, topRated, filters, items } = explorer;
  const sectorPhotos = useSectorPhotos();
  const photoForSection = (section: NafSection | null): string | undefined => (section ? sectorPhotos[section] : undefined);

  return (
    <View style={styles.sections}>
      {sectors.length > 0 ? (
        <View style={styles.section}>
          <ContentColumn>
            <SectionHeader title={t('home.sectors')} caption={t('home.sectorsHint')} />
          </ContentColumn>
          <HorizontalRail accessibilityLabel={t('home.sectors')}>
            {sectors.map(({ value, count }) => (
              <SectorCard
                key={value}
                section={value}
                count={count}
                selected={filters.sector === value}
                onPress={explorer.toggleSector}
                photoUrl={sectorPhotos[value]}
              />
            ))}
          </HorizontalRail>
        </View>
      ) : null}

      {topRated.length > 0 ? (
        <View style={styles.section}>
          <ContentColumn>
            <SectionHeader title={t('home.topRated')} caption={t('home.topRatedHint', { count: TOP_RATED_MIN_REVIEWS })} />
          </ContentColumn>
          <HorizontalRail accessibilityLabel={t('home.topRated')}>
            {topRated.map((company) => (
              <FeaturedCompanyCard
                key={company.id}
                company={company}
                onPress={onOpenCompany}
                photoUrl={photoForSection(nafSectionFromCode(company.naf_code))}
              />
            ))}
          </HorizontalRail>
        </View>
      ) : null}

      <ContentColumn>
        <ShareReviewBanner />
      </ContentColumn>

      {cities.length > 0 ? (
        <ContentColumn style={styles.section}>
          <SectionHeader title={t('home.cities')} />
          <CityChips cities={cities} selected={filters.city} onSelect={explorer.toggleCity} />
        </ContentColumn>
      ) : null}

      {items.length > 0 ? (
        <ContentColumn>
          <SectionHeader title={t('search.mostReviewed')} />
        </ContentColumn>
      ) : null}
    </View>
  );
}

export default DiscoverSections;
