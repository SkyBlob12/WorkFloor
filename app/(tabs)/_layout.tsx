import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { useTranslation } from 'react-i18next';

import { BottomTabBar } from '@components/navigation/BottomTabBar';
import { TabButton } from '@components/navigation/TabButton';

const fill = { flex: 1 } as const;

export default function TabsLayout() {
  const { t } = useTranslation('common');
  return (
    <Tabs style={fill}>
      <TabSlot style={fill} />
      <TabList asChild>
        <BottomTabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={{ active: 'search', inactive: 'search-outline' }} label={t('nav.companies')} />
          </TabTrigger>
          <TabTrigger name="add" href="/add" asChild>
            <TabButton icon={{ active: 'add-circle', inactive: 'add-circle-outline' }} label={t('nav.addShort')} />
          </TabTrigger>
          <TabTrigger name="account" href="/account" asChild>
            <TabButton icon={{ active: 'person-circle', inactive: 'person-circle-outline' }} label={t('nav.account')} />
          </TabTrigger>
        </BottomTabBar>
      </TabList>
    </Tabs>
  );
}
