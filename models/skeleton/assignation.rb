module BlackStack
    module Scraper
        class Assignation < Sequel::Model(:scr_assignation)
            many_to_one :user, :class=>:'BlackStack::MySaaS::User', :key=>:id_user            
            many_to_one :page, :class=>:'BlackStack::Scraper::Page', :key=>:id_page            
        end # class Assignation
    end # Scraper
end # BlackStack