
import React from 'react'

import {
    HeaderView,
    HeaderTitle,
    HeaderButton,
    colors
} from "../styles/appStyles"

import {MaterialCommunityIcons, AntDesign} from "@expo/vector-icons"

const Header = ({handleClearAppliances, info}) =>  {
    return (
      <HeaderView>
        <HeaderTitle>Kodinkoneet</HeaderTitle>
        <HeaderButton onPress={info}>
        <AntDesign name="infocirlceo" size={25} color={colors.tertiary} />
        </HeaderButton>
        <HeaderButton
        onPress={handleClearAppliances}>
            <MaterialCommunityIcons name = "trash-can-outline" size={25} color={colors.tertiary} />
        </HeaderButton>

      </HeaderView>
    )
}
export default Header;