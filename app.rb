# default screen
get "/scraper", :agent => /(.*)/ do
    redirect2 "/scraper/dashboard", params
end
get "/content/", :agent => /(.*)/ do
    redirect2 "/scraper/dashboard", params
end

# public screens (signup/landing page)
get "/scraper/signup", :agent => /(.*)/ do
    erb :"/extensions/scraper/views/signup", :layout => :"/views/layouts/public"
end

# public screens (login page)
get "/scraper/login", :agent => /(.*)/ do
    erb :"/extensions/scraper/views/login", :layout => :"/views/layouts/public"
end
