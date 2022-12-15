module BlackStack
    module Scraper
        class Movement < Sequel::Model(:scr_movement)
            many_to_one :user, :class=>:'BlackStack::MySaaS::User', :key=>:id_user
            many_to_one :page, :class=>:'BlackStack::Scraper::Page', :key=>:id_page
            TYPE_EARNING = 0
            TYPE_PAYOUT = 1
        end # class Movement
    end # Scraper
end # BlackStack