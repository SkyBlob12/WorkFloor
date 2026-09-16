import type { ComponentProps } from 'react';

import type Feather from '@expo/vector-icons/Feather';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IconName = ComponentProps<typeof Feather>['name'];
export type IoniconName = ComponentProps<typeof Ionicons>['name'];
