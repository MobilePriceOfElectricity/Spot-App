
import React from 'react'

import {
    HeaderView,
    HeaderTitle,
    HeaderButton,
    colors
} from "../styles/appStyles"

import {MaterialCommunityIcons} from "@expo/vector-icons"

const Header = ({handleClearAppliances}) =>  {
    return (
      <HeaderView>
        <HeaderTitle>Kodinkoneet</HeaderTitle>
        <HeaderButton
        onPress={handleClearAppliances}>
            <MaterialCommunityIcons name = "trash-can-outline" size={25} color={colors.tertiary} />
        </HeaderButton>
      </HeaderView>
    )
}
export default Header;