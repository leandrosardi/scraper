# default screen
get "/scraper", :agent => /(.*)/ do
    redirect2 "/scraper/dashboard", params
end
get "/scraper/", :agent => /(.*)/ do
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

# internal app screens - dashboard
get "/scraper/dashboard", :auth => true, :agent => /(.*)/ do
    erb :"/extensions/scraper/views/dashboard", :layout => :"/views/layouts/core"
end
get "/scraper/dashboard/", :auth => true, :agent => /(.*)/ do
    erb :"/extensions/scraper/views/dashboard", :layout => :"/views/layouts/core"
end

# isn: internal scraping network
get '/api1.0/scraper/login.json' do
    erb :'views/api1.0/scraper/login'
end
post '/api1.0/scraper/login.json' do
    erb :'views/api1.0/scraper/login'
end
  
get '/api1.0/scraper/get.json' do
    erb :'views/api1.0/scraper/get'
end
post '/api1.0/scraper/get.json' do
    erb :'views/api1.0/scraper/get'
end
  
get '/api1.0/scraper/upload.json' do
    erb :'views/api1.0/scraper/upload'
end
post '/api1.0/scraper/upload.json' do
    erb :'views/api1.0/scraper/upload'
end
  
