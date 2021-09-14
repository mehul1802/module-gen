<?php

namespace ChildTheme\Modules\Sample4\General;

use Theme\BaseTheme\General\ThemeOptions;
use Theme\BaseTheme\General\ThemeOptions\ThemeOptionFieldsTrait;
use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class ModuleSettings
 *
 * @package Theme\Modules\Sample4\General
 */
class ModuleSettings extends ThemeModuleAbstractClass {

    use ThemeFlexClassTrait;
    use ThemeOptionFieldsTrait;

    public function init() {
        add_action( 'acf/init', [ $this, 'registerTabs' ] );
    }

    /**
     * @param string $optionGroupKey
     */
    public function registerTab( string $optionGroupKey ): void {
        $optionFieldKey = $optionGroupKey . '__pass_unique_key';

        $fields = $this->getFields();
        $fields = baseTheme()->applyFilters( 'theme_options/pass_unique_key/sub_fields', $fields, $optionFieldKey );

        $this->addTab( $this->baseTheme->__( 'Key Label' ), $optionGroupKey, $optionFieldKey )
            ->addFields( $fields, $optionGroupKey, $optionFieldKey )
            ->registerFields();
    }

    public function registerTabs() {
        $this->registerTab( ThemeOptions::THEME_OPTIONS_KEY );
    }

    /**
     * @return array[]
     */
    private function getFields(): array {
        $fields = [];

        return $fields;
    }
}

