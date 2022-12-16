module BlackStack
    module Scraper
        # inherit from BlackStack::MySaaS::User
        class Account < BlackStack::MySaaS::Account
            one_to_many :users, :class=>:'BlackStack::Scraper::User', :key=>:id_account

            # get the orders of all users of this account
            def orders
                self.users.map { |u| u.orders }.flatten
            end
        end # class Account
    end # module Scraper
end # module BlackStack